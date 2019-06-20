const fs = require('fs-extra');
const path = require('path');
const walkSync = require('walk-sync');
const cache = require('../../../lib/cache');

const telemetry = cache.has('telemetry') ? JSON.parse(cache.get('telemetry').value) : {};
const ADDON_PATHS = {};

let packagePaths = walkSync('./', {
  globs: ['**/package.json'],
  ignore: ['node_modules/**'],
});

for (let packagePath of packagePaths) {
  let { name } = fs.readJsonSync(packagePath);

  ADDON_PATHS[path.dirname(path.resolve('.', packagePath))] = name;
}

/**
 * Transforms a literal "on disk" path to a "module path".
 *
 * @param {String} filePath the path on disk (from current working directory)
 * @returns {String} The in-browser module path for the specified filePath
 */
function getModulePathFor(filePath, addonPaths = ADDON_PATHS) {
  let fileSegments = filePath.split('/');
  let addonSegments = [];

  while (fileSegments.length > 0) {
    addonSegments.push(fileSegments.shift());

    if (addonPaths[addonSegments.join('/')]) {
      break;
    }
  }

  let addonFilePath = addonSegments.join('/');
  let addonName = addonPaths[addonFilePath];

  let relativeFilePath = fileSegments
    .join('/')
    .replace(/^(addon|app)\//, '')
    .replace(/\.[^/.]+$/, '');

  return `${addonName}/${relativeFilePath}`;
}

/**
 * Get the runtime data for the file being transformed
 *
 * @param {String} filePath Absolute path of the file to read data from
 * @returns {Object} Runtime configuration object
 */
function getTelemetryFor(filePath) {
  let modulePath = getModulePathFor(filePath);

  return telemetry[modulePath];
}

module.exports = {
  getTelemetryFor,
  getModulePathFor,
};
