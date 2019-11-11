#!/usr/bin/env node
'use strict';
const argv = require('yargs')
  .boolean(['class-fields', 'decorators', 'classic-decorator'])
  .string(['type', 'quote']).argv;

const { gatherTelemetryForUrl, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

(async () => {
  await gatherTelemetryForUrl(argv[2], analyzeEmberObject);

  require('codemod-cli').runTransform(
    __dirname,
    'ember-object',
    argv.slice(2) /* paths or globs */
  );
})();
