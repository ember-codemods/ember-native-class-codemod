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
  "@ember-decorators/object": ["action", "readOnly", "volatile"],
  "@ember-decorators/component": [
    "layout",
    "className",
    "classNames",
    "tagName",
    "attribute"
  ]
};

const METHOD_DECORATORS = ["action", "on", "observer"];

const META_DECORATORS = {
  readOnly: "reads",
  reads: "overridableReads",
  oneWay: "overridableReads"
};

const DEFAULT_OPTIONS = {
  decorators: false,
  classFields: true
};

const LAYOUT_IMPORT_SPECIFIER = "templateLayout";

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

module.exports = {
  capitalizeFirstLetter,
  DECORATOR_PATHS,
  EMBER_DECORATOR_SPECIFIERS,
  get,
  getModifier,
  getOptions,
  getPropCalleeName,
  getPropName,
  getPropType,
  isClassDecoratorProp,
  LAYOUT_IMPORT_SPECIFIER,
  META_DECORATORS,
  METHOD_DECORATORS,
  shouldSetValue,
  startsWithUpperCaseLetter
};
