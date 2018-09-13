const UNSUPPORTED_PROP_NAMES = ["actions", "layout"];

/**
 * Interates through instance properties and verify if it has any prop which can not be transformed
 *
 * @param {Object} { instanceProps } map of object properties
 * @param {Object} { decorators }
 * @returns Boolean
 */
function hasValidProps(
  { instanceProps = [] } = {},
  { decorators = false, classFields = true } = {}
) {
  const unsupportedPropNames = decorators ? [] : UNSUPPORTED_PROP_NAMES;

  return instanceProps.every(instanceProp => {
    if (
      (!decorators &&
        (instanceProp.hasDecorators || instanceProp.isClassDecorator)) ||
      unsupportedPropNames.includes(instanceProp.name) ||
      (!classFields && instanceProp.type === "Literal") ||
      (instanceProp.type === "ObjectExpression" &&
        instanceProp.name !== "actions") ||
      (instanceProp.isCallExpression && !instanceProp.hasDecorators)
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Returns true if object extends mixin
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Object} varDeclaration - VariableDeclaration
 */
function isExtendsMixin(j, eoCallExpression) {
  return j(eoCallExpression).get("arguments").value.length > 1;
}

module.exports = { hasValidProps, isExtendsMixin };
