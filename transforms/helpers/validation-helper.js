const UNSUPPORTED_PROP_NAMES = [
  "layout",
  "tagName",
  "classNames",
  "classNameBindings",
  "attributeBindings",
  "actions"
];

const SUPPORTED_PROP_VALUE_TYPES = ["Literal", "Identifier"];

/**
 * Interates through instance properties and verify if it has any prop which can not be transformed
 * Following special prop names are not supported now. The support will be added in future iterations
 * [ "tagName", "classNames", "classNameBindings", "attributeBindings", "actions"]
 * Please note that only ["Literal", "Identifier"] types are supported as prop values
 *
 * @param {Object} { instanceProps, functionProps } map of instance and function properties
 * @returns Boolean
 */
function hasValidProps({ instanceProps, functionProps } = {}) {
  return instanceProps.every(instanceProp => {
    if (
      UNSUPPORTED_PROP_NAMES.includes(instanceProp.key.name) ||
      !SUPPORTED_PROP_VALUE_TYPES.includes(instanceProp.value.type)
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
function isExtendsMixin(j, eoExpression) {
  return j(eoExpression).get("arguments").value.length > 1;
}

module.exports = { hasValidProps, isExtendsMixin };
