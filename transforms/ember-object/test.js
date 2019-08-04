'use strict';

const path = require('path');
const { runTransformTest } = require('codemod-cli');
const { setTelemetry } = require('ember-codemods-telemetry-helpers');

// bootstrap the mock telemetry data
const walkSync = require('walk-sync');
const mockTelemetryData = require('./__testfixtures__/-mock-telemetry.json');

// This is nasty, cwd is screwed up here for some reason
let testFiles = walkSync('./transforms/ember-object/__testfixtures__', {
  globs: ['**/*.input.js'],
});
let mockTelemetry = {};

for (let testFile of testFiles) {
  let moduleName = testFile.replace(/\.input\.[^/.]+$/, '');
  let value = mockTelemetryData[moduleName] || {};

  mockTelemetry[path.resolve(__dirname, `./__testfixtures__/${moduleName}`)] = value;
}

setTelemetry(mockTelemetry);

runTransformTest({
  type: 'jscodeshift',
  name: 'ember-object',
});
