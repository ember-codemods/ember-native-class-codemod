const { getOptions } = require("codemod-cli");
const { replaceEmberObjectExpressions } = require("../helpers/parse-helper");
const { getRuntimeData } = require("../helpers/util");

module.exports = function transformer(file, api, opts) {
  const j = api.jscodeshift;
  const options = Object.assign({}, opts, getOptions());
  let { source, path } = file;
  const runtimeConfigPath = options["runtime-config-path"];

  if (runtimeConfigPath) {
    options.runtimeData = getRuntimeData(runtimeConfigPath, path);
    if (!options.runtimeData) {
      return;
    }
  }

  const root = j(source);

  replaceEmberObjectExpressions(j, root, path, options);

  return root.toSource();
};

// Set the parser, needed for supporting decorators
module.exports.parser = "flow";
