import type { ParserOptions } from '@babel/core';
import { parse } from '@babel/parser';
import type { Parser } from 'jscodeshift';

// Inspired by https://github.com/ember-codemods/ember-component-template-colocation-migrator/blob/50c37e5ab8710ced7815dd6c968af97cade23aa4/lib/utils/js-parser.js#L7

const options: ParserOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: true,
  tokens: true,
  plugins: [
    // Without this, our @classic decorators cause this error:
    // > Using the export keyword between a decorator and a class is not allowed.
    // > Please use `export @dec class` instead.
    // Additionally, we have some users using legacy decorator features, such
    // as decorators in object literals
    'decorators-legacy',
    'exportDefaultFrom',
    'typescript',
  ],
};

const parser: Parser = {
  parse(code) {
    return parse(code, options);
  },
};

export default parser;
