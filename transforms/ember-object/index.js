const { getOptions } = require("codemod-cli");
const { replaceEmberObjectExpressions } = require("../helpers/parse-helper");

module.exports = function transformer(file, api, opts) {
  const j = api.jscodeshift;
  const options = Object.assign({}, opts, getOptions());
  let { source, path } = file;

  const root = j(source);

  replaceEmberObjectExpressions(j, root, path, options);

  return root.toSource();
};

// Set the parser, needed for supporting decorators
module.exports.parser = "flow";
