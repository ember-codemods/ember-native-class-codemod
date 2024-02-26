#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

(async () => {
  // `NO_TELEMETRY=true npx ember-native-class-codemod path`
  // => ['node', 'ember-native-class-codemod', 'path']
  let args = process.argv.slice(2);
  if (process.env['NO_TELEMETRY'] !== 'true') {
    await gatherTelemetryForUrl(process.argv[2], analyzeEmberObject);
    // `npx ember-native-class-codemod http://localhost path`
    // => ['node', 'ember-native-class-codemod', 'http://localhost', 'path']
    args = process.argv.slice(3);
  }

  require('codemod-cli').runTransform(__dirname, 'ember-object', args);
})();
