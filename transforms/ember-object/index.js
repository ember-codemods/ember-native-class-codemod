const { getOptions } = require('codemod-cli');
const { replaceEmberObjectExpressions } = require('../helpers/parse-helper');

const DEFAULT_OPTIONS = {
  decorators: true,
  classFields: true,
  classicDecorator: true,
  quote: 'single',
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const options = Object.assign({}, DEFAULT_OPTIONS, getOptions());
  let { source, path } = file;

  const root = j(source);

  const replaced = replaceEmberObjectExpressions(j, root, path, options);
  if (replaced) {
    source = root.toSource({
      quote: options.quotes || options.quote,
    });
  }
  return source;
};

// Set the parser, needed for supporting decorators
module.exports.parser = 'flow';
