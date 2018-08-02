const { get } = require("./util");

/**
 * Copy comments `from` => `to`
 *
 * @param {Object} to
 * @param {Object} from
 */
function withComments(to, from) {
  to.comments = from.comments;
  return to;
}

/**
 * Transform instance properties to MemberExpressions
 *
 * For example: `prop: value` --> `this.prop = value`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} instanceProps Array of object properties
 * @returns {ExpressionStatement[]}
 */
function instancePropsToExpressions(j, instanceProps) {
  return instanceProps.map(instanceProp =>
    withComments(
      j.expressionStatement(
        j.assignmentExpression(
          "=",
          j.memberExpression(j.thisExpression(), instanceProp.key),
          instanceProp.value
        )
      ),
      instanceProp
    )
  );
}

/**
 * Creates an empty `super()` expressions
 *
 * @param {Object} j - jscodeshift lib reference
 * @returns ExpressionStatement
 */
function createSuperExpressionStatement(j) {
  return j.expressionStatement(j.callExpression(j.super(), []));
}

/**
 * Replace instances of `this._super(...arguments)` to `super.methodName(...arguments)`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {MethodDefinition} methodDefinition - MethodDefinition to replce instances from
 * @returns MethodDefinition
 */
function replaceSuperExpressions(j, methodDefinition) {
  const superExprs = j(methodDefinition).find(j.ExpressionStatement, {
    expression: {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        property: {
          type: "Identifier",
          name: "_super"
        }
      }
    }
  });

  if (!superExprs.length) {
    return methodDefinition;
  }

  superExprs.forEach(superExpr => {
    const superMethodArgs = get(superExpr, "value.expression.arguments") || [];
    const superMethodCall = j.expressionStatement(
      j.callExpression(
        j.memberExpression(j.super(), methodDefinition.key),
        superMethodArgs
      )
    );
    j(superExpr).replaceWith(superMethodCall);
  });

  return methodDefinition;
}

/**
 * Transform functions to class methods
 *
 * For example { foo: function() { }} --> { foo() { }}
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} functionProps
 * @returns {MethodDefinition[]}
 */
function functionPropsToMethods(j, functionProps = []) {
  return functionProps.map(functionProp => {
    const propKind =
      functionProp.kind === "init" ? "method" : functionProp.kind;
    return withComments(
      replaceSuperExpressions(
        j,
        j.methodDefinition(propKind, functionProp.key, functionProp.value)
      ),
      functionProp
    );
  });
}

/**
 * Create  a constructor method
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} instanceProps Array of Properties to be instantiated in the constructor
 * @return {Array|MethodDefinition[]}
 */
function createConstructor(j, instanceProps = []) {
  if (instanceProps.length) {
    return [
      j.methodDefinition(
        "constructor",
        j.identifier("constructor"),
        j.functionExpression(
          null,
          [],
          j.blockStatement(
            [createSuperExpressionStatement(j)].concat(
              instancePropsToExpressions(j, instanceProps)
            )
          )
        )
      )
    ]; // Todo: find a way to include params
  }

  return [];
}

/**
 * Create  a class properties
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} instanceProps
 * @return {ClassProperty[]}
 */
function createClassProperties(j, instanceProps = []) {
  return instanceProps.map(instanceProp => {
    const classProp = withComments(
      j.classProperty(instanceProp.key, instanceProp.value, null),
      instanceProp
    );

    classProp.computed = instanceProp.computed;
    return classProp;
  });
}

/**
 * Create the class
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} className
 * @param {Object} { instanceProps: Property[], functionProps: Property[] } map of instance and function properties
 */
function createClass(j, className, { instanceProps, functionProps } = {}) {
  return j.classDeclaration(
    className ? j.identifier(className) : null,
    j.classBody(
      []
        .concat(createClassProperties(j, instanceProps))
        .concat(functionPropsToMethods(j, functionProps))
    ),
    j.identifier("EmberObject")
  );
}

module.exports = {
  withComments,
  instancePropsToExpressions,
  createSuperExpressionStatement,
  functionPropsToMethods,
  createConstructor,
  createClassProperties,
  createClass
};
