/**
 * Return the map of instance props and functions from Ember Object
 *
 * For example
 * const myObj = EmberObject.extend({ key: value, foo: function() {}, baz() {} });
 * will be parsed as:
 *{
    instanceProps: [ key: value ]
    functionProps: [ FunctionExpression(foo), FunctionExpression(baz) ]
  }
 * @param {Object} j - jscodeshift lib reference
 * @param { File } emberObjectExpression
 * @returns { instanceProps: Property[], functionProps: Property[] } map of instance and function properties
 */
function getEmberObjectProperties(j, emberObjectExpression) {
  const objProps = j(emberObjectExpression)
    .find(j.ObjectExpression)
    .get("properties").value;

  const instanceProps = [];
  const functionProps = [];

  objProps.forEach(prop => {
    if (prop.value.type === "FunctionExpression") {
      functionProps.push(prop);
    } else {
      instanceProps.push(prop);
    }
  });
  return { instanceProps, functionProps };
}

/**
 * Find the `EmberObject.extend` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param { File } root
 * @returns { CallExpression[] }
 */
function getEmberObjectExpressions(j, root) {
  return root.find(j.CallExpression, {
    callee: {
      object: {
        name: "EmberObject"
      },
      property: {
        name: "extend"
      }
    }
  });
}

/**
 * Returns the variable name
 *
 * @param {VariableDeclarator} varDeclaration
 * @returns String
 */
function getVariableName(varDeclaration) {
  return varDeclaration.get
    ? varDeclaration.get("declarations", "0", "id", "name").value
    : "";
}

/**
 * Return closest parent var declaration statement
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {CallExpression} eoExpression
 * @returns VariableDeclaration
 */
function getClosetVariableDeclaration(j, eoExpression) {
  const varDeclarations = j(eoExpression).closest(j.VariableDeclaration);
  return varDeclarations.length > 0 ? varDeclarations.get() : null;
}

module.exports = {
  getEmberObjectProperties,
  getEmberObjectExpressions,
  getVariableName,
  getClosetVariableDeclaration
};
