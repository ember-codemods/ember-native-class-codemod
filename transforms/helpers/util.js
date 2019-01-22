const fs = require("fs");
const fsPath = require("path");

const LAYOUT_DECORATOR_NAME = "layout";
const LAYOUT_DECORATOR_LOCAL_NAME = "templateLayout";

const DECORATOR_PATHS = {
  "@ember/object": {
    importPropDecoratorMap: {
      observer: "observes",
      computed: "computed"
    },
    decoratorPath: "@ember-decorators/object"
  },
  "@ember/object/evented": {
    importPropDecoratorMap: {
      on: "on"
    },
    decoratorPath: "@ember-decorators/object/evented"
  },
  "@ember/controller": {
    importPropDecoratorMap: {
      inject: "controller"
    },
    decoratorPath: "@ember-decorators/controller"
  },
  "@ember/service": {
    importPropDecoratorMap: {
      inject: "service"
    },
    decoratorPath: "@ember-decorators/service"
  },
  "@ember/object/computed": {
    decoratorPath: "@ember-decorators/object/computed"
  }
};

const EMBER_DECORATOR_SPECIFIERS = {
  "@ember-decorators/object": [
    "action",
    "off",
    "readOnly",
    "unobserves",
    "volatile"
  ],
  "@ember-decorators/component": [
    "attribute",
    "className",
    "classNames",
    LAYOUT_DECORATOR_NAME,
    "tagName",
    LAYOUT_DECORATOR_LOCAL_NAME
  ]
};

const METHOD_DECORATORS = ["action", "on", "observer"];

const DEFAULT_OPTIONS = {
  decorators: false,
  classFields: true
};

const ACTION_SUPER_EXPRESSION_COMMENT = [
  " TODO: This call to super is within an action, and has to refer to the parent",
  " class's actions to be safe. This should be refactored to call a normal method",
  " on the parent class. If the parent class has not been converted to native",
  " classes, it may need to be refactored as well. See",
  " https: //github.com/scalvert/ember-es6-class-codemod/blob/master/README.md",
  " for more details."
];

/**
 * Get a property from and object, useful to get nested props without checking for null values
 *
 * @param {Object} obj
 * @param {String} key
 * @returns {Any}
 */
function get(obj, path) {
  return path.split(".").reduce(function(currentObject, pathSegment) {
    return typeof currentObject == "undefined" || currentObject === null
      ? currentObject
      : currentObject[pathSegment];
  }, obj);
}

/**
 * Return name of the property
 *
 * @param {Property} prop
 * @returns {String}
 */
function getPropName(prop) {
  return get(prop, "key.name");
}

/**
 * Return type of the property
 *
 * @param {Property} prop
 * @returns {String}
 */
function getPropType(prop) {
  return get(prop, "value.type");
}

/**
 * Return the callee name of the property
 *
 * @param {Property} prop
 * @returns {String}
 */
function getPropCalleeName(prop) {
  return (
    get(prop, "value.callee.name") ||
    get(prop, "value.callee.object.callee.name")
  );
}

/**
 * Returns true if class property should have value
 *
 * @param {Property} prop
 * @returns {Boolean}
 */
function shouldSetValue(prop) {
  if (!prop.hasDecorators) {
    return true;
  }
  return prop.decoratorNames.every(
    decoratorName =>
      decoratorName === "className" || decoratorName === "attribute"
  );
}

/**
 * Convert the first letter to uppercase
 *
 * @param {String} name
 * @returns {String}
 */
function capitalizeFirstLetter(name) {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
}

/**
 * Returns true if the first character in the word is uppercase
 *
 * @param {String} word
 * @returns {Boolean}
 */
function startsWithUpperCaseLetter(word = "") {
  return !!word && word.charAt(0) !== word.charAt(0).toLowerCase();
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
 * Get the transform options
 *
 * @param {Object} options
 */
function getOptions(options) {
  return Object.assign({}, DEFAULT_OPTIONS, options);
}

/**
 * Get property modifier from the property callee object
 *
 * @param {Expression} calleeObject
 */
function getModifier(calleeObject) {
  return {
    prop: get(calleeObject, "callee.property"),
    args: get(calleeObject, "arguments")
  };
}

/**
 * Get the runtime data for the file being transformed
 *
 * @param {String} configConfigPath Configuration file path (Absolute)
 * @param {String} filePath Path of the file to read data from
 * @returns {Object} Runtime configuration object
 */
function getRuntimeData(configConfigPath, filePath) {
  let runtimeConfigJSON = {};
  try {
    runtimeConfigJSON = JSON.parse(fs.readFileSync(configConfigPath));
  } catch (e) {
    runtimeConfigJSON = { data: [{}] };
  }
  const runtimeConfigs = runtimeConfigJSON.data[0];
  // Relative path is needed for testing,
  // However the paths should always be absolute to avoid confusion
  const relativePath = filePath.replace(
    fsPath.resolve(`${__dirname}/../..`),
    "."
  );
  return runtimeConfigs[filePath] || runtimeConfigs[relativePath];
}

module.exports = {
  ACTION_SUPER_EXPRESSION_COMMENT,
  capitalizeFirstLetter,
  DECORATOR_PATHS,
  EMBER_DECORATOR_SPECIFIERS,
  get,
  getModifier,
  getOptions,
  getPropCalleeName,
  getPropName,
  getPropType,
  getRuntimeData,
  isClassDecoratorProp,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
  METHOD_DECORATORS,
  shouldSetValue,
  startsWithUpperCaseLetter
};
