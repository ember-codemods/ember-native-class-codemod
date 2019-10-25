#!/usr/bin/env node
'use strict';

const { gatherTelemetry, analyzeEmberObject } = require('ember-codemods-telemetry-helpers');

gatherTelemetry(process.argv[2], analyzeEmberObject);
