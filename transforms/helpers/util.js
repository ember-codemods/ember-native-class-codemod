const DECORATOR_PROP_NAME = {
  "on:@ember/object/evented": "on",
  "observer:@ember/object": "observes",
  "inject:@ember/controller": "controller",
  "inject:@ember/service": "service",
  "computed:@ember/object": "computed"
};

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
  return get(prop, "value.callee.name");
}

/**
 * Return the callee name of the computed property
 *
 * @param {Property} prop
 * @returns {String}
 */
function getComputedPropertyName(prop) {
  return (
    getPropCalleeName(prop) || get(prop, "value.callee.object.callee.name")
  );
}

/**
 * Returns true if class property should have value
 *
 * @param {Property} prop
 * @returns {Boolean}
 */
function shouldSetValue(prop) {
  const decoratorName = prop.decoratorName;
  return (
    !decoratorName ||
    decoratorName === "className" ||
    decoratorName === "attribute"
  );
}

/**
 * Checks if the passed property is `computed`
 *
 * @param {Property} prop
 * @param {String[]} importedComputedProps
 * @returns {Boolean}
 */
function isComputedProperty(prop, importedComputedProps) {
  const calleeName = getComputedPropertyName(prop);
  return (
    get(prop, "value.type") === "CallExpression" &&
    (calleeName === "computed" || importedComputedProps.includes(calleeName))
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

module.exports = {
  DECORATOR_PROP_NAME,
  capitalizeFirstLetter,
  get,
  getPropName,
  getPropType,
  shouldSetValue,
  getPropCalleeName,
  getComputedPropertyName,
  isComputedProperty,
  startsWithUpperCaseLetter
};
