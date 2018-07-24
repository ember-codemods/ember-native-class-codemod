const {
  hasValidProps,
  isExtendsMixin
} = require("../helpers/validation-helper");
const { withComments, createClass } = require("../helpers/transform-helper");
const { capitalizeFirstLetter, get } = require("../helpers/util");
const {
  getEmberObjectProperties,
  getEmberObjectExpressions,
  getVariableName,
  getClosetVariableDeclaration
} = require("../helpers/parse-helper");

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  getEmberObjectExpressions(j, root).forEach(eoExpression => {
    if (isExtendsMixin(j, eoExpression)) {
      return;
    }

    const eoProperties = getEmberObjectProperties(j, eoExpression);
    if (!hasValidProps(eoProperties)) {
      return;
    }

    const varDeclaration = getClosetVariableDeclaration(j, eoExpression);
    const className = varDeclaration
      ? capitalizeFirstLetter(getVariableName(varDeclaration))
      : "";

    const es6ClassDeclaration = createClass(j, className, eoProperties);
    const isFollowedByCreate =
      get(eoExpression, "parentPath.value.property.name") === "create";

    let expressionToReplace = eoExpression;
    if (varDeclaration && !isFollowedByCreate) {
      expressionToReplace = varDeclaration;
    }

    withComments(es6ClassDeclaration, expressionToReplace.value);

    j(expressionToReplace).replaceWith(es6ClassDeclaration);
  });

  return root.toSource();
};
