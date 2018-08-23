const { get, getPropType } = require("./util");

const UNSUPPORTED_PROP_NAMES = ["actions", "layout"];

/**
 * Interates through instance properties and verify if it has any prop which can not be transformed
 *
 * @param {Object} { instanceProps, computedProps, classDecoratorProps } map of object properties
 * @param {Boolean} useDecorator
 * @returns Boolean
 */
function hasValidProps(
  { instanceProps = [], computedProps = [], classDecoratorProps = [] } = {},
  useDecorator = false
) {
  if (!useDecorator && (computedProps.length || classDecoratorProps.length)) {
    return false;
  }

  const unsupportedPropNames = useDecorator ? [] : UNSUPPORTED_PROP_NAMES;

  return instanceProps.every(instanceProp => {
    const propName = get(instanceProp, "key.name");
    const propType = getPropType(instanceProp);

    if (
      (!useDecorator && instanceProp.decoratorName) ||
      unsupportedPropNames.includes(propName) ||
      (propType === "ObjectExpression" && propName !== "actions") ||
      (propType === "CallExpression" && !instanceProp.decoratorName)
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
