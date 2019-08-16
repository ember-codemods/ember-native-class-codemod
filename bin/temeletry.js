#!/usr/bin/env node
'use strict';

const { gatherTelemetry } = require('ember-codemods-telemetry-helpers');

gatherTelemetry(process.argv[2]);
