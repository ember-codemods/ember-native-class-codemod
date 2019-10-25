const path = require('path');
const { getCoercedOptions } = require('../helpers/options');
const { replaceEmberObjectExpressions } = require('../helpers/parse-helper');

const DEFAULT_OPTIONS = {
  decorators: true,
  classFields: true,
  classicDecorator: true,
  quote: 'single',
};

module.exports = function transformer(file, api) {
  const extension = path.extname(file.path);

  if (!['.js', '.ts'].includes(extension.toLowerCase())) {
    // do nothing on non-js/ts files
    return;
  }

  const j = api.jscodeshift;
  const options = Object.assign(
    {},
    DEFAULT_OPTIONS,
    getCoercedOptions(['decorators', 'classFields', 'classicDecorator'])
  );
  let { source } = file;

  const root = j(source);

  const replaced = replaceEmberObjectExpressions(j, root, file.path, options);
  if (replaced) {
    source = root.toSource({
      quote: options.quotes || options.quote,
    });
  }
  return source;
};

// Set the parser, needed for supporting decorators
module.exports.parser = 'flow';
