const { get, getPropName, shouldSetValue } = require("./util");
const {
  withDecorators,
  createClassDecorators,
  createInstancePropDecorators,
  createActionDecorators
} = require("./decorator-helper");

/**
 * Copy comments `from` => `to`
 *
 * @param {Object} to
 * @param {Object} from
 * @returns {Object}
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
 * @returns {ExpressionStatement}
 */
function createSuperExpressionStatement(j) {
  return j.expressionStatement(j.callExpression(j.super(), []));
}

/**
 * Replace instances of `this._super(...arguments)` to `super.methodName(...arguments)`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {MethodDefinition} methodDefinition - MethodDefinition to replce instances from
 * @returns {MethodDefinition}
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
 * @param {Decorator[]} decorators
 * @returns {MethodDefinition[]}
 */
function functionPropsToMethods(j, functionProps = [], decorators = []) {
  return functionProps.map(functionProp => {
    const propKind =
      functionProp.kind === "init" ? "method" : functionProp.kind;
    return withDecorators(
      withComments(
        replaceSuperExpressions(
          j,
          j.methodDefinition(propKind, functionProp.key, functionProp.value)
        ),
        functionProp
      ),
      decorators
    );
  });
}

/**
 * Create  a constructor method
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} instanceProps Array of Properties to be instantiated in the constructor
 * @return {MethodDefinition[]}
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
    ];
  }

  return [];
}

/**
 * Create the class property from passed instance property
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property} instanceProp
 * @returns {ClassProperty}
 */
function createClassProperty(j, instanceProp) {
  const decorators = createInstancePropDecorators(j, instanceProp);

  const classProp = withDecorators(
    withComments(
      j.classProperty(
        instanceProp.key,
        shouldSetValue(instanceProp) ? instanceProp.value : null,
        null
      ),
      instanceProp
    ),
    decorators
  );
  classProp.computed = instanceProp.computed;
  return classProp;
}

/**
 * Create action decorators
 *
 * Converts
 * {
 *  actions: {
 *    foo() {}
 *  }
 * }
 * to
 * {
 *  @action
 *  foo(){ }
 * }
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property} actionsProp
 * @returns {MethodDefinition[]}
 */
function createActionDecoratedProperties(j, actionsProp) {
  const actionProps = get(actionsProp, "value.properties");
  return functionPropsToMethods(j, actionProps, createActionDecorators(j));
}

/**
 * Iterate and covert the instance properties to class properties
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} instanceProps
 * @return {ClassProperty[]}
 */
function createClassProperties(j, instanceProps = []) {
  return instanceProps.reduce((classProps, instanceProp) => {
    const instancePropName = getPropName(instanceProp);

    if (instancePropName === "actions") {
      return classProps.concat(
        createActionDecoratedProperties(j, instanceProp)
      );
    }

    classProps.push(createClassProperty(j, instanceProp));
    return classProps;
  }, []);
}

/**
 * Iterate and covert the computed properties to class methods
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} computedProps
 * @return {Property[]}
 */
function createComputedProperties(j, computedProps = []) {
  return computedProps.reduce((props, computedProp) => {
    const cpNameKey = get(computedProp, "key");
    const cpArgs = get(computedProp, "value.arguments").slice(0);
    const cpExpr = cpArgs.pop();
    const cpType = get(cpExpr, "type");

    let cpDecorators = [];

    if (cpType === "FunctionExpression" || cpType === "ObjectExpression") {
      cpDecorators = createInstancePropDecorators(j, computedProp);
    }
    if (cpType === "FunctionExpression") {
      const functionExpr = {
        kind: "init",
        key: cpNameKey,
        value: cpExpr,
        comments: computedProp.comments
      };
      return props.concat(
        functionPropsToMethods(j, [functionExpr], cpDecorators)
      );
    } else if (cpType === "ObjectExpression") {
      const cpFunctions = cpExpr.properties.map(cpFunction => {
        cpFunction.kind = getPropName(cpFunction);
        cpFunction.key = cpNameKey;
        return cpFunction;
      });
      const cpMethods = functionPropsToMethods(j, cpFunctions);
      withComments(cpMethods[0], computedProp);
      withDecorators(cpMethods[0], cpDecorators);
      return props.concat(cpMethods);
    } else {
      props.push(createClassProperty(j, computedProp));
      return props;
    }
  }, []);
}

function createSuperClassExpression(j, superClassName = "", mixins = []) {
  if (mixins.length > 0) {
    return j.callExpression(
      j.memberExpression(j.identifier(superClassName), j.identifier("extend")),
      mixins
    );
  }
  return j.identifier(superClassName);
}

/**
 * Create the class
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} className
 * @param {Object} {
 *  instanceProps: Property[],
 *  functionProps: Property[],
 *  computedProps: Property[],
 *  classDecoratorProps: Property[],
 * } ember object properties
 * @param {String} superClassName
 * @param {Expressions[]} mixins
 */
function createClass(
  j,
  className,
  {
    instanceProps = [],
    computedProps = [],
    functionProps = [],
    classDecoratorProps = []
  } = {},
  superClassName = "",
  mixins = []
) {
  return withDecorators(
    j.classDeclaration(
      className ? j.identifier(className) : null,
      j.classBody(
        []
          .concat(createClassProperties(j, instanceProps))
          .concat(createComputedProperties(j, computedProps))
          .concat(functionPropsToMethods(j, functionProps))
      ),
      createSuperClassExpression(j, superClassName, mixins)
    ),
    createClassDecorators(j, classDecoratorProps)
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
