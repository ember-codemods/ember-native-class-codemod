const { getOptions } = require("codemod-cli");
const { replaceEmberObjectExpressions } = require("../helpers/parse-helper");

module.exports = function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  replaceEmberObjectExpressions(
    j,
    root,
    file.path,
    Object.assign({}, options, getOptions())
  );

  return root.toSource();
};

// Set the parser, needed for supporting decorators
module.exports.parser = "flow";
