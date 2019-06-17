const fs = require("fs-extra");
const path = require("path");
const walkSync = require("walk-sync");
const getRepoInfo = require("git-repo-info");
const Cache = require("sync-disk-cache");

const gitInfo = getRepoInfo();
const cache = new Cache(`native-class-codemod-${gitInfo.sha}`);

const telemetry = cache.has("telemetry")
  ? JSON.parse(cache.get("telemetry").value)
  : {};
const addonFilePaths = {};

let packagePaths = walkSync("./", {
  globs: ["**/package.json"],
  ignore: ["node_modules/**"]
});

for (let packagePath of packagePaths) {
  let { name } = fs.readJsonSync(packagePath);

  addonFilePaths[path.dirname(path.resolve(".", packagePath))] = name;
}

/**
 * Get the runtime data for the file being transformed
 *
 * @param {String} runtimeConfigPath Configuration file path (Absolute)
 * @param {String} filePath Absolute path of the file to read data from
 * @returns {Object} Runtime configuration object
 */
module.exports = function getTelemetryData(filePath) {
  let fileSegments = filePath.split("/");
  let addonSegments = [];

  while (fileSegments.length > 0) {
    addonSegments.push(fileSegments.shift());

    if (addonFilePaths[addonSegments.join("/")]) {
      break;
    }
  }

  let addonFilePath = addonSegments.join("/");
  let addonName = addonFilePaths[addonFilePath];

  let relativeFilePath = fileSegments
    .join("/")
    .replace(/^(addon|app)\//, "")
    .replace(/\.[^/.]+$/, "");

  return telemetry[`${addonName}/${relativeFilePath}`];
};
