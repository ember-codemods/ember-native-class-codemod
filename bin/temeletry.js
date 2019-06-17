#!/usr/bin/env node
"use strict";

const gatherTelemetry = require("../lib/gather-telemetry");

gatherTelemetry(process.argv[2]);
