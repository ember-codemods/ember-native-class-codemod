const path = require('path');
const camelCase = require('camelcase');
const { capitalizeFirstLetter, get, startsWithUpperCaseLetter } = require('./util');
const { getTelemetryFor } = require('./util/get-telemetry-for');
const { hasValidProps, isFileOfType, isTestFile } = require('./validation-helper');
const { createClass, withComments } = require('./transform-helper');
const { createDecoratorImportDeclarations, getImportedDecoratedProps } = require('./import-helper');
const EOProp = require('./EOProp');
const logger = require('./log-helper');

/**
 * Return the map of instance props and functions from Ember Object
 *
 * For example
 * const myObj = EmberObject.extend({ key: value });
 * will be parsed as:
 * {
 *   instanceProps: [ Property({key: value}) ]
 *  }
 * @param {Object} j - jscodeshift lib reference
 * @param {ObjectExpression} emberObjectExpression
 * @returns {Object} Object of instance and function properties
 */
function getEmberObjectProps(j, eoExpression, importedDecoratedProps = {}, runtimeData = {}) {
  const objProps = get(eoExpression, 'properties') || [];

  const instanceProps = [];
  const attributeBindingsProps = {};
  const classNameBindingsProps = {};

  objProps.forEach(objProp => {
    const prop = new EOProp(objProp);
    if (prop.name === 'classNameBindings') {
      Object.assign(classNameBindingsProps, parseBindingProps(prop.value.elements));
    } else if (prop.name === 'attributeBindings') {
      Object.assign(attributeBindingsProps, parseBindingProps(prop.value.elements));
    } else {
      prop.setDecorators(importedDecoratedProps);
      prop.setRuntimeData(runtimeData);
      instanceProps.push(prop);
    }
  });

  // Assign decorator names to the binding props if any
  instanceProps.forEach(instanceProp => {
    instanceProp.addBindingProps(attributeBindingsProps, classNameBindingsProps);
  });

  return {
    instanceProps,
  };
}

/**
 * Split the binding property values using `:` as separator
 *
 * For example ["isEnabled:enabled:disabled", "a:b:c", "c:d"] will be parsed as
 * {
 *  isEnabled:["enabled", "disabled"],
 *  a: ["b", "c"],
 *  c: ["d"]
 * }
 *
 * @param {Array} bindingPropElements
 * @returns {Object}
 */
function parseBindingProps(bindingPropElements = []) {
  return bindingPropElements.reduce((props, bindingElement) => {
    const [boundPropName, ...bindingElementList] = bindingElement.value.split(':');
    props[boundPropName.trim()] = bindingElementList;
    return props;
  }, {});
}

/**
 * Get the map of decorators to import other than the computed props, services etc
 * which already have imports in the code
 *
 * @param {EOProp[]} instanceProps
 * @param {Object} decoratorsMap
 */
function getDecoratorsToImportMap(instanceProps, decoratorsMap = {}) {
  return instanceProps.reduce((specs, prop) => {
    return {
      action: specs.action || prop.isAction,
      wrapComputed: specs.wrapComputed || prop.hasWrapComputedDecorator,
      attribute: specs.attribute || prop.hasAttributeDecorator,
      className: specs.className || prop.hasClassNameDecorator,
      classNames: specs.classNames || prop.isClassNames,
      layout: specs.layout || prop.isLayoutDecorator,
      templateLayout: specs.templateLayout || prop.isTemplateLayoutDecorator,
      off: specs.off || prop.hasOffDecorator,
      tagName: specs.tagName || prop.isTagName,
      unobserves: specs.unobserves || prop.hasUnobservesDecorator,
    };
  }, decoratorsMap);
}

/**
 * Find the `EmberObject.extend` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {CallExpression[]}
 */
function getEmberObjectCallExpressions(j, root) {
  return root
    .find(j.CallExpression, { callee: { property: { name: 'extend' } } })
    .filter(
      eoCallExpression =>
        startsWithUpperCaseLetter(get(eoCallExpression, 'value.callee.object.name')) &&
        get(eoCallExpression, 'parentPath.value.type') !== 'ClassDeclaration'
    );
}

/**
 * Returns the variable name
 *
 * @param {VariableDeclaration} varDeclaration
 * @returns {String}
 */
function getVariableName(varDeclaration) {
  return get(varDeclaration, 'value.declarations.0.id.name');
}

/**
 * Return closest parent var declaration statement
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {CallExpression} eoCallExpression
 * @returns {VariableDeclaration}
 */
function getClosestVariableDeclaration(j, eoCallExpression) {
  const varDeclarations = j(eoCallExpression).closest(j.VariableDeclaration);
  return varDeclarations.length > 0 ? varDeclarations.get() : null;
}

/**
 * Get the expression to replace
 *
 * It returns either VariableDeclaration or the CallExpression depending on how the object is created
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {CallExpression} eoCallExpression
 * @returns {CallExpression|VariableDeclaration}
 */
function getExpressionToReplace(j, eoCallExpression) {
  const varDeclaration = getClosestVariableDeclaration(j, eoCallExpression);
  const isFollowedByCreate = get(eoCallExpression, 'parentPath.value.property.name') === 'create';

  let expressionToReplace = eoCallExpression;
  if (varDeclaration && !isFollowedByCreate) {
    expressionToReplace = varDeclaration;
  }
  return expressionToReplace;
}

/**
 * Returns name of class to be created
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} classVariableName
 * @param {String} filePath
 * @return {String}
 */
function getClassName(j, classVariableName, filePath, superClassName, type = '') {
  const className = classVariableName || camelCase(path.basename(filePath, 'js'));
  let capitalizedClassName = `${capitalizeFirstLetter(className)}${capitalizeFirstLetter(type)}`;
  if (capitalizedClassName === superClassName) {
    capitalizedClassName = capitalizeFirstLetter(className);
  }
  return capitalizedClassName;
}

/**
 * Parse ember object call expression, returns EmberObjectExpression and list of mixins
 *
 * @param {CallExpression} eoCallExpression
 * @returns {Object}
 */
function parseEmberObjectCallExpression(eoCallExpression) {
  const callExpressionArgs = get(eoCallExpression, 'value.arguments') || [];
  const props = {
    eoExpression: null,
    mixins: [],
  };
  callExpressionArgs.forEach(callExpressionArg => {
    if (callExpressionArg.type === 'ObjectExpression') {
      props.eoExpression = callExpressionArg;
    } else {
      props.mixins.push(callExpressionArg);
    }
  });
  return props;
}

/**
 * Main entry point for parsing and replacing ember objects
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @param {String} filePath
 * @param {Object} options
 */
function replaceEmberObjectExpressions(j, root, filePath, options = {}) {
  options.runtimeData = getTelemetryFor(path.resolve(filePath));

  if (!options.runtimeData) {
    logger.warn(`[${filePath}]: SKIPPED Could not find runtime data NO_RUNTIME_DATA`);
    return;
  }

  if (isTestFile(filePath)) {
    logger.warn(`[${filePath}]: Skipping test file`);
    return;
  }

  if (options.type && !isFileOfType(filePath, options.type)) {
    logger.warn(
      `[${filePath}]: FAILURE Type mismatch, expected type '${options.type}' did not match type of file`
    );
    return;
  }
  // Parse the import statements
  const importedDecoratedProps = getImportedDecoratedProps(j, root);
  let transformed = false;
  let decoratorsToImportMap = {};

  getEmberObjectCallExpressions(j, root).forEach(eoCallExpression => {
    const { eoExpression, mixins } = parseEmberObjectCallExpression(eoCallExpression);

    const eoProps = getEmberObjectProps(
      j,
      eoExpression,
      importedDecoratedProps,
      options.runtimeData
    );

    const errors = hasValidProps(j, eoProps, options);
    if (errors.length) {
      logger.warn(`[${filePath}]: FAILURE \nValidation errors: \n\t${errors.join('\n\t')}`);
      return;
    }

    const superClassName = get(eoCallExpression, 'value.callee.object.name');
    const varDeclaration = getClosestVariableDeclaration(j, eoCallExpression);
    const classVariableName = getVariableName(varDeclaration);
    const className = getClassName(
      j,
      classVariableName,
      filePath,
      superClassName,
      get(options, 'runtimeData.type')
    );

    if (classVariableName) {
      root.findVariableDeclarators(classVariableName).renameTo(className);
    }

    const es6ClassDeclaration = createClass(j, className, eoProps, superClassName, mixins, options);

    const expressionToReplace = getExpressionToReplace(j, eoCallExpression);
    j(expressionToReplace).replaceWith(
      withComments(es6ClassDeclaration, expressionToReplace.value)
    );

    transformed = true;

    decoratorsToImportMap = getDecoratorsToImportMap(eoProps.instanceProps, decoratorsToImportMap);
  });

  // Need to find another way, as there might be a case where
  // one object from a file is transformed and other is not
  if (transformed) {
    const decoratorsToImport = Object.keys(decoratorsToImportMap).filter(
      key => decoratorsToImportMap[key]
    );
    createDecoratorImportDeclarations(j, root, decoratorsToImport, options);
    logger.info(`[${filePath}]: SUCCESS`);
  }
  return transformed;
}

module.exports = {
  getClassName,
  getClosestVariableDeclaration,
  getEmberObjectCallExpressions,
  getEmberObjectProps,
  getExpressionToReplace,
  getVariableName,
  replaceEmberObjectExpressions,
};
