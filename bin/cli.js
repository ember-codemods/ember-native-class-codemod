#!/usr/bin/env node
"use strict";

const gatherTelemetry = require("../lib/gather-telemetry");

gatherTelemetry(process.argv[2]);

require("codemod-cli").runTransform(
  __dirname,
  "ember-object",
  process.argv.slice(2) /* paths or globs */
);
