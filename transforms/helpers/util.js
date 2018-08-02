/**
 * Convert the first letter to uppercase
 *
 * @param {String} name
 * @returns String
 */
function capitalizeFirstLetter(name) {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
}

/**
 * Get a property from and object, useful to get nested props without checking for null values
 *
 * @param {Object} obj
 * @param {String} key
 */
function get(obj, path) {
  return path.split(".").reduce(function(currentObject, pathSegment) {
    return typeof currentObject == "undefined" || currentObject === null
      ? currentObject
      : currentObject[pathSegment];
  }, obj);
}

module.exports = { capitalizeFirstLetter, get };
