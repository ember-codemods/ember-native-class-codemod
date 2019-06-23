const fs = require('fs-extra');
const path = require('path');
const walkSync = require('walk-sync');
const cache = require('../../../lib/cache');

const telemetry = cache.has('telemetry') ? JSON.parse(cache.get('telemetry').value) : {};
const ADDON_PATHS = {};
const APP_PATHS = {};

let packagePaths = walkSync('./', {
  globs: ['**/package.json'],
  ignore: ['**/tmp/**', '**/node_modules/**'],
});

for (let packagePath of packagePaths) {
  let pkg = fs.readJsonSync(packagePath);

  let packageDir = path.dirname(path.resolve('.', packagePath));

  if (pkg.keywords && pkg.keywords.includes('ember-addon')) {
    ADDON_PATHS[packageDir] = pkg.name;
  } else if (isEmberCliProject(pkg)) {
    APP_PATHS[packageDir] = pkg.name;
  }
}

function isEmberCliProject(pkg) {
  return (
    pkg &&
    ((pkg.dependencies && Object.keys(pkg.dependencies).indexOf('ember-cli') !== -1) ||
      (pkg.devDependencies && Object.keys(pkg.devDependencies).indexOf('ember-cli') !== -1))
  );
}

/**
 * Transforms a literal "on disk" path to a "module path".
 *
 * @param {String} filePath the path on disk (from current working directory)
 * @returns {String} The in-browser module path for the specified filePath
 */
function getModulePathFor(filePath, addonPaths = ADDON_PATHS, appPaths = APP_PATHS) {
  let bestMatch = '';
  let moduleNameRoot, relativePath, isApp, result;

  for (let addonPath in addonPaths) {
    if (filePath.startsWith(addonPath) && addonPath.length > bestMatch.length) {
      bestMatch = addonPath;
      moduleNameRoot = addonPaths[addonPath];
      relativePath = filePath.slice(
        addonPath.length + 1 /* for slash */,
        -path.extname(filePath).length
      );
    }
  }

  for (let appPath in appPaths) {
    if (filePath.startsWith(appPath) && appPath.length > bestMatch.length) {
      bestMatch = appPath;
      moduleNameRoot = appPaths[appPath];
      relativePath = filePath.slice(
        appPath.length + 1 /* for slash */,
        -path.extname(filePath).length
      );
      isApp = true;
    }
  }

  if (!relativePath && process.cwd() === path.resolve(__dirname, '../../..')) {
    // this is pretty odd, but our tests in
    // transforms/ember-object/__testfixtures__ don't actually live in an ember
    // app or addon, so the standard logic above doesn't work for them
    //
    // this works by passing through the input file name when we are operating
    // on the local ember-es6-class-codemod repo **and** we were not able to
    // resolve a relativePath via normal means
    return filePath.replace(/\.[^/.]+$/, '');
  }

  if (!relativePath) {
    return;
  }

  if (isApp) {
    if (relativePath.startsWith('app')) {
      result = `${moduleNameRoot}${relativePath.slice(3)}`;
    } else if (relativePath.startsWith('tests')) {
      result = `${moduleNameRoot}/${relativePath}`;
    }
  } else {
    if (relativePath.startsWith('addon-test-support')) {
      result = `${moduleNameRoot}/test-support${relativePath.slice(18)}`;
    } else if (relativePath.startsWith('addon')) {
      result = `${moduleNameRoot}${relativePath.slice(5)}`;
    }
  }

  return result;
}

/**
 * Get the runtime data for the file being transformed
 *
 * @param {String} filePath Absolute path of the file to read data from
 * @returns {Object} Runtime configuration object
 */
function getTelemetryFor(filePath) {
  let modulePath = getModulePathFor(filePath);
  let data = telemetry[modulePath];

  return data;
}

module.exports = {
  getTelemetryFor,
  getModulePathFor,
};
