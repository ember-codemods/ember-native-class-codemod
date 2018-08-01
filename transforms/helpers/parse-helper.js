const path = require("path");
const camelCase = require("camelcase");
const {
  get,
  getPropName,
  getPropType,
  getPropCalleeName,
  capitalizeFirstLetter,
  isComputedProperty,
  getComputedPropertyName,
  startsWithUpperCaseLetter,
  DECORATOR_PROP_NAME
} = require("./util");
const { hasValidProps } = require("../helpers/validation-helper");
const { withComments, createClass } = require("./transform-helper");

/**
 * Return the map of instance props and functions from Ember Object
 *
 * For example
 * const myObj = EmberObject.extend({ key: value, foo: function() {}, baz() {} });
 * will be parsed as:
 * {
 *   instanceProps: [ Property({key: value}) ]
 *   functionProps: [ FunctionExpression(foo), FunctionExpression(baz) ]
 *   computedProps: [],
 *   classDecoratorProps: [],
 *  }
 * @param {Object} j - jscodeshift lib reference
 * @param {ObjectExpression} emberObjectExpression
 * @returns {Object} Object of instance and function properties
 */
function getEmberObjectProperties(
  j,
  eoExpression,
  importedComputedPropMacros = [],
  importedDecoratedProps = {}
) {
  const objProps = get(eoExpression, "properties") || [];

  const instanceProps = [];
  const functionProps = [];
  const classDecoratorProps = [];
  const computedProps = [];
  const attributeBindingsProps = {};
  const classNameBindingsProps = {};

  objProps.forEach(prop => {
    const propName = getPropName(prop);
    if (propName === "classNameBindings") {
      Object.assign(
        classNameBindingsProps,
        parseBindingProps(prop.value.elements)
      );
    } else if (propName === "attributeBindings") {
      Object.assign(
        attributeBindingsProps,
        parseBindingProps(prop.value.elements)
      );
    } else {
      if (isClassDecoratorProp(propName)) {
        classDecoratorProps.push(prop);
      } else if (getPropType(prop) === "FunctionExpression") {
        functionProps.push(prop);
      } else if (isComputedProperty(prop, importedComputedPropMacros)) {
        prop.isComputed = true;
        prop.decoratorName = getComputedPropertyName(prop);
        computedProps.push(prop);
      } else {
        const calleeName = getPropCalleeName(prop);
        if (calleeName) {
          prop.decoratorName = importedDecoratedProps[calleeName];
        }
        instanceProps.push(prop);
      }
    }
  });

  // Assign decoator names to the binding props if any
  instanceProps.forEach(instanceProp => {
    const instancePropName = getPropName(instanceProp);
    if (attributeBindingsProps[instancePropName]) {
      instanceProp.decoratorName = "attribute";
      instanceProp.propList = attributeBindingsProps[instancePropName];
    } else if (classNameBindingsProps[instancePropName]) {
      instanceProp.decoratorName = "className";
      instanceProp.propList = classNameBindingsProps[instancePropName];
    }
  });

  return {
    instanceProps,
    computedProps,
    functionProps,
    classDecoratorProps
  };
}

/**
 * Return true if prop is of name `tagName` or `classNames`
 * @param {Property} prop
 * @returns boolean
 */
function isClassDecoratorProp(propName) {
  return (
    propName === "tagName" || propName === "classNames" || propName === "layout"
  );
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
    const bindingElementList = bindingElement.value.split(":");
    const boundPropName = bindingElementList.shift().trim();
    props[boundPropName] = bindingElementList;
    return props;
  }, {});
}

/**
 * Get computed prop macros from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {String[]}
 */
function getImportedComputedPropMacros(j, root) {
  const computedPropImports = root.find(j.ImportDeclaration, {
    source: {
      value: "@ember/object/computed"
    }
  });

  if (!computedPropImports.length) {
    return [];
  }

  const cpImport = computedPropImports.get().value;
  return cpImport.specifiers.map(specifier => get(specifier, "local.name"));
}

/**
 * Get decorated props from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {Object}
 */
function getImportedDecoratedProps(j, root) {
  const importedDecorators = {};
  const importedPaths = Object.keys(DECORATOR_PROP_NAME);

  importedPaths.forEach(importedPath => {
    const [imported, path] = importedPath.split(":");
    const decorator = DECORATOR_PROP_NAME[importedPath];
    const decoratorImports = root.find(j.ImportDeclaration, {
      source: {
        value: path
      }
    });

    if (!decoratorImports.length) {
      return;
    }

    const decoratorImport = decoratorImports.get().value;

    decoratorImport.specifiers.forEach(specifier => {
      const decoratorLocalName = get(specifier, "local.name");
      const decoratorImportedName = get(specifier, "imported.name");
      if (imported === decoratorImportedName) {
        importedDecorators[decoratorLocalName] = decorator;
      }
    });
  });

  return importedDecorators;
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
    .find(j.CallExpression, { callee: { property: { name: "extend" } } })
    .filter(
      eoCallExpression =>
        startsWithUpperCaseLetter(
          get(eoCallExpression, "value.callee.object.name")
        ) &&
        get(eoCallExpression, "parentPath.value.type") !== "ClassDeclaration"
    );
}

/**
 * Returns the variable name
 *
 * @param {VariableDeclaration} varDeclaration
 * @returns {String}
 */
function getVariableName(varDeclaration) {
  return get(varDeclaration, "value.declarations.0.id.name");
}

/**
 * Return closest parent var declaration statement
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {CallExpression} eoCallExpression
 * @returns {VariableDeclaration}
 */
function getClosetVariableDeclaration(j, eoCallExpression) {
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
  const varDeclaration = getClosetVariableDeclaration(j, eoCallExpression);
  const isFollowedByCreate =
    get(eoCallExpression, "parentPath.value.property.name") === "create";

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
 * @param {CallExpression} eoCallExpression
 * @param {String} filePath
 * @return {String}
 */
function getClassName(j, eoCallExpression, filePath) {
  const varDeclaration = getClosetVariableDeclaration(j, eoCallExpression);
  const className =
    getVariableName(varDeclaration) || camelCase(path.basename(filePath, "js"));
  return capitalizeFirstLetter(className);
}

/**
 * Parse ember object call expression, returns EmberObjectExpression and list of mixins
 *
 * @param {CallExpression} eoCallExpression
 * @returns {Object}
 */
function parseEmberObjectCallExpression(eoCallExpression) {
  const callExpressionArgs = get(eoCallExpression, "value.arguments") || [];
  const props = {
    eoExpression: null,
    mixins: []
  };
  callExpressionArgs.forEach(callExpressionArg => {
    if (callExpressionArg.type === "ObjectExpression") {
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
  // Parse the import statements
  const importedComputedPropMacros = getImportedComputedPropMacros(j, root);
  const importedDecoratedProps = getImportedDecoratedProps(j, root);

  getEmberObjectCallExpressions(j, root).forEach(eoCallExpression => {
    const { eoExpression, mixins } = parseEmberObjectCallExpression(
      eoCallExpression
    );
    if (mixins.length && !options.mixins) {
      return;
    }

    const eoProperties = getEmberObjectProperties(
      j,
      eoExpression,
      importedComputedPropMacros,
      importedDecoratedProps
    );

    if (!hasValidProps(eoProperties, options.decorators)) {
      return;
    }

    const superClassName = get(eoCallExpression, "value.callee.object.name");
    const es6ClassDeclaration = createClass(
      j,
      getClassName(j, eoCallExpression, filePath),
      eoProperties,
      superClassName,
      mixins
    );

    const expressionToReplace = getExpressionToReplace(j, eoCallExpression);
    j(expressionToReplace).replaceWith(
      withComments(es6ClassDeclaration, expressionToReplace.value)
    );
  });
}

module.exports = {
  getVariableName,
  getEmberObjectProperties,
  getEmberObjectCallExpressions,
  getImportedComputedPropMacros,
  getImportedDecoratedProps,
  getClosetVariableDeclaration,
  getExpressionToReplace,
  replaceEmberObjectExpressions,
  getClassName
};
