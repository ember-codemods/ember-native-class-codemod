'use strict';

const { runTransformTest } = require('codemod-cli');
const transform = require('./index');

runTransformTest({
  type: 'jscodeshift',
  name: 'ember-object',
});