const { getOptions } = require("codemod-cli");
const { decoratorsAfterExport } = require("../helpers/util");
const { replaceEmberObjectExpressions } = require("../helpers/parse-helper");

module.exports = function transformer(file, api, opts) {
  const j = api.jscodeshift;
  const options = Object.assign({}, opts, getOptions());
  let { source, path } = file;

  let transformOptions = {};

  if (options.quotes || options.quote) {
    transformOptions.quote = options.quotes || options.quote;
  }

  const root = j(source);

  const replaced = replaceEmberObjectExpressions(j, root, path, options);
  if (replaced) {
    source = decoratorsAfterExport(root.toSource(transformOptions));
  }
  return source;
};

// Set the parser, needed for supporting decorators
module.exports.parser = "flow";
