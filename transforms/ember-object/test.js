"use strict";

const { runTransformTest } = require("codemod-cli");

// bootstrap the mock telemetry data
const getRepoInfo = require("git-repo-info");
const Cache = require("sync-disk-cache");
const walkSync = require("walk-sync");
const mockTelemetryData = require("./__testfixtures__/-mock-telemetry.json");

const gitInfo = getRepoInfo();
const cache = new Cache(`native-class-codemod-${gitInfo.sha}`);

// This is nasty, cwd is screwed up here for some reason
let testFiles = walkSync("./transforms/ember-object/__testfixtures__", {
  globs: ["**/*.input.js"]
});
let mockTelemetry = {};

for (let testFile of testFiles) {
  let moduleName = testFile.replace(/\.[^/.]+$/, "");
  let value = mockTelemetryData[moduleName] || {};

  mockTelemetry[
    `ember-es6-class-codemod/transforms/ember-object/__testfixtures__/${moduleName}`
  ] = value;
}

cache.set("telemetry", JSON.stringify(mockTelemetry));

runTransformTest({
  type: "jscodeshift",
  name: "ember-object"
});
