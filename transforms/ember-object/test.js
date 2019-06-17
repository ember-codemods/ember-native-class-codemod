"use strict";

const { runTransformTest } = require("codemod-cli");

// bootstrap the mock telemetry data
const getRepoInfo = require("git-repo-info");
const Cache = require("sync-disk-cache");
const mockTelemetry = require("./__testfixtures__/-mock-telemetry.json");

const gitInfo = getRepoInfo();
const cache = new Cache(`native-class-codemod-${gitInfo.sha}`);

cache.set("telemetry", JSON.stringify(mockTelemetry));

runTransformTest({
  type: "jscodeshift",
  name: "ember-object"
});
