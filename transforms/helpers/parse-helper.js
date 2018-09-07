const path = require("path");
const camelCase = require("camelcase");
const {
  get,
  getOptions,
  capitalizeFirstLetter,
  startsWithUpperCaseLetter,
  DECORATOR_PATHS
} = require("./util");
const { hasValidProps } = require("./validation-helper");
const {
  withComments,
  createClass,
  createImportDeclaration
} = require("./transform-helper");
const EOProp = require("./EOProp");

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
function getEmberObjectProps(j, eoExpression, importedDecoratedProps = {}) {
  const objProps = get(eoExpression, "properties") || [];

  const instanceProps = [];
  const attributeBindingsProps = {};
  const classNameBindingsProps = {};

  objProps.forEach(objProp => {
    const prop = new EOProp(objProp);
    if (prop.name === "classNameBindings") {
      Object.assign(
        classNameBindingsProps,
        parseBindingProps(prop.value.elements)
      );
    } else if (prop.name === "attributeBindings") {
      Object.assign(
        attributeBindingsProps,
        parseBindingProps(prop.value.elements)
      );
    } else {
      prop.setDecorators(importedDecoratedProps);
      instanceProps.push(prop);
    }
  });

  // Assign decoator names to the binding props if any
  instanceProps.forEach(instanceProp => {
    instanceProp.addBindingProps(
      attributeBindingsProps,
      classNameBindingsProps
    );
  });

  return {
    instanceProps
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
    const [boundPropName, ...bindingElementList] = bindingElement.value.split(
      ":"
    );
    props[boundPropName.trim()] = bindingElementList;
    return props;
  }, {});
}

/**
 * Return the decorator name for the specifier if any, using the importPropDecoratorMap from
 * `DECORATOR_PATHS` config (defined util.js)
 *
 * @param {ImportSpecifier} specifier
 * @param {Object} importPropDecoratorMap
 * @returns {String}
 */
function getDecoratorInfo(specifier, importPropDecoratorMap) {
  const localName = get(specifier, "local.name");
  const importedName = get(specifier, "imported.name");
  const isImportedAs = importedName !== localName;
  let decoratorName;
  if (isImportedAs || !importPropDecoratorMap) {
    decoratorName = localName;
  } else {
    decoratorName = importPropDecoratorMap[importedName];
  }
  return { decoratorName, localName, importedName, isImportedAs };
}

/**
 * Returns true of the specifier is a decorator
 *
 * @param {ImportSpecifier} specifier
 * @param {Object} importPropDecoratorMap
 * @returns {Boolean}
 */
function isSpecifierDecorator(specifier, importPropDecoratorMap) {
  const importedName = get(specifier, "imported.name");
  if (!importPropDecoratorMap || importPropDecoratorMap[importedName]) {
    return true;
  }
  return false;
}

/**
 * Set decorator name and remove the duplicated `local` property on specifier
 *
 * @param {ImportSpecifier} specifier
 * @param {Object} importPropDecoratorMap
 * @returns {ImportSpecifier}
 */
function setSpecifierProps(specifier, importPropDecoratorMap) {
  const importedName = get(specifier, "imported.name");
  if (importPropDecoratorMap) {
    specifier.imported.name = importPropDecoratorMap[importedName];
  }
  if (importedName === get(specifier, "local.name")) {
    specifier.local = null;
  }
  return specifier;
}

/**
 * Get decorated props from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {ImportDeclaration[]}
 */
function getDecoratorImports(j, root) {
  return Object.keys(DECORATOR_PATHS).reduce((imports, path) => {
    const decoratorImports = root.find(j.ImportDeclaration, {
      source: {
        value: path
      }
    });

    if (decoratorImports.length) {
      imports.push(decoratorImports.get());
    }

    return imports;
  }, []);
}

/**
 * Get decorated props from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {Object}
 */
function createDecoratorImportDeclarations(j, root) {
  getDecoratorImports(j, root).forEach(decoratorImport => {
    const { importPropDecoratorMap, decoratorPath } = DECORATOR_PATHS[
      get(decoratorImport, "value.source.value")
    ];

    const decoratedSpecifiers = [];
    const specifiers = get(decoratorImport, "value.specifiers") || [];

    for (let i = specifiers.length - 1; i >= 0; i -= 1) {
      const specifier = specifiers[i];

      if (isSpecifierDecorator(specifier, importPropDecoratorMap)) {
        decoratedSpecifiers.push(
          setSpecifierProps(specifier, importPropDecoratorMap)
        );
        specifiers.splice(i, 1);
      }
    }
    if (decoratedSpecifiers.length) {
      const importDeclaration = createImportDeclaration(
        j,
        decoratedSpecifiers,
        decoratorPath
      );

      if (specifiers.length <= 0) {
        j(decoratorImport).replaceWith(importDeclaration);
      } else {
        j(decoratorImport).insertAfter(importDeclaration);
      }
    }
  });
}

/**
 * Get decorated props from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {Object}
 */
function getImportedDecoratedProps(j, root) {
  return getDecoratorImports(j, root).reduce(
    (importedDecorators, decoratorImport) => {
      const { importPropDecoratorMap } = DECORATOR_PATHS[
        get(decoratorImport, "value.source.value")
      ];

      const specifiers = get(decoratorImport, "value.specifiers") || [];

      return specifiers.reduce((importedDecorators, specifier) => {
        if (isSpecifierDecorator(specifier, importPropDecoratorMap)) {
          importedDecorators[get(specifier, "local.name")] = getDecoratorInfo(
            specifier,
            importPropDecoratorMap
          );
        }
        return importedDecorators;
      }, importedDecorators);
    },
    {}
  );
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
  const importedDecoratedProps = getImportedDecoratedProps(j, root);
  let transformed = false;

  getEmberObjectCallExpressions(j, root).forEach(eoCallExpression => {
    const { eoExpression, mixins } = parseEmberObjectCallExpression(
      eoCallExpression
    );

    const eoProps = getEmberObjectProps(
      j,
      eoExpression,
      importedDecoratedProps
    );

    if (!hasValidProps(eoProps, getOptions(options))) {
      return;
    }

    const superClassName = get(eoCallExpression, "value.callee.object.name");
    const es6ClassDeclaration = createClass(
      j,
      getClassName(j, eoCallExpression, filePath),
      eoProps,
      superClassName,
      mixins
    );

    const expressionToReplace = getExpressionToReplace(j, eoCallExpression);
    j(expressionToReplace).replaceWith(
      withComments(es6ClassDeclaration, expressionToReplace.value)
    );
    transformed = true;
  });
  // Need to find another way, as there might be a case where
  // one object from a file is transformed and other is not
  if (transformed) {
    createDecoratorImportDeclarations(j, root);
  }
}

module.exports = {
  getVariableName,
  getEmberObjectProps,
  getEmberObjectCallExpressions,
  getClosetVariableDeclaration,
  getExpressionToReplace,
  replaceEmberObjectExpressions,
  getClassName
};
