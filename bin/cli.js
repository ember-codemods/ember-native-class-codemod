#!/usr/bin/env node
'use strict';

const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

(async () => {
  let args = process.argv.slice(2);
  if (process.env['NO_TELEMETRY'] !== 'true') {
    await gatherTelemetryForUrl(process.argv[2], analyzeEmberObject);
    args = process.argv.slice(1);
  }

  require('codemod-cli').runTransform(__dirname, 'ember-object', args);
})();
