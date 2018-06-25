#!/usr/bin/env node
'use strict';

require('codemod-cli').runTransform(
  __dirname,
  process.argv[2]       /* transform name */,
  process.argv.slice(2) /* paths or globs */
)