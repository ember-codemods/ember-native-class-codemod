const {
  ACTION_SUPER_EXPRESSION_COMMENT,
  get,
  getPropName,
  shouldSetValue
} = require("./util");
const {
  withDecorators,
  createClassDecorator,
  createInstancePropDecorators,
  createIdentifierDecorators
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

function createLineComments(j, lines = []) {
  return lines.map(line => j.commentLine(line));
}

/**
 * Transform instance properties to MemberExpressions
 *
 * For example: `prop: value` --> `this.prop = value`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp[]} instanceProps Array of object properties
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
function replaceSuperExpressions(
  j,
  methodDefinition,
  replaceWithUndefined,
  isAction = false
) {
  const superExprs = j(methodDefinition).find(j.CallExpression, {
    callee: {
      type: "MemberExpression",
      property: {
        type: "Identifier",
        name: "_super"
      }
    }
  });

  if (!superExprs.length) {
    return methodDefinition;
  }
  superExprs.forEach(superExpr => {
    if (replaceWithUndefined) {
      j(superExpr).replaceWith(j.identifier("undefined"));
    } else {
      let superMethodCall;
      const superMethodArgs = get(superExpr, "value.arguments") || [];
      if (isAction) {
        superMethodCall = j.callExpression(
          j.memberExpression(
            j.memberExpression(
              j.memberExpression(j.super(), j.identifier("actions")),
              methodDefinition.key
            ),
            j.identifier("call")
          ),
          [].concat(j.thisExpression(), ...superMethodArgs)
        );
        superMethodCall.comments = createLineComments(
          j,
          ACTION_SUPER_EXPRESSION_COMMENT
        );
      } else {
        superMethodCall = j.callExpression(
          j.memberExpression(j.super(), methodDefinition.key),
          superMethodArgs
        );
      }
      j(superExpr).replaceWith(superMethodCall);
    }
  });

  return methodDefinition;
}

/**
 * Transform functions to class methods
 *
 * For example { foo: function() { }} --> { foo() { }}
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp} functionProp
 * @param {Decorator[]} decorators
 * @returns {MethodDefinition[]}
 */
function createMethodProp(
  j,
  functionProp,
  decorators = [],
  replaceWithUndefined = false,
  isAction = false
) {
  const propKind = functionProp.kind === "init" ? "method" : functionProp.kind;
  if (functionProp.hasRuntimeData) {
    replaceWithUndefined = !functionProp.isOverridden;
  }
  return withDecorators(
    withComments(
      replaceSuperExpressions(
        j,
        j.methodDefinition(propKind, functionProp.key, functionProp.value),
        replaceWithUndefined,
        isAction
      ),
      functionProp
    ),
    decorators
  );
}

/**
 * Create  a constructor method
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp[]} instanceProps Array of Properties to be instantiated in the constructor
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
 * @param {EOProp} instanceProp
 * @returns {ClassProperty}
 */
function createClassProp(j, instanceProp) {
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
 * @param {EOProp} actionsProp
 * @returns {MethodDefinition[]}
 */
function createActionDecoratedProps(j, actionsProp) {
  const actionProps = get(actionsProp, "value.properties");
  const overriddenActions = get(actionsProp, "overriddenActions") || [];
  const actionDecorators = createIdentifierDecorators(j);
  return actionProps.map(actionProp =>
    createMethodProp(
      j,
      actionProp,
      actionDecorators,
      actionsProp.hasRuntimeData &&
        !overriddenActions.includes(actionProp.key.name),
      true
    )
  );
}

/**
 * Iterate and covert the computed properties to class methods
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp} callExprProp
 * @return {Property[]}
 */
function createCallExpressionProp(j, callExprProp) {
  const callExprArgs = callExprProp.callExprArgs.slice(0);
  const callExprLastArg = callExprArgs.pop();
  const lastArgType = get(callExprLastArg, "type");

  if (lastArgType === "FunctionExpression") {
    const functionExpr = {
      kind: callExprProp.kind,
      key: callExprProp.key,
      value: callExprLastArg,
      comments: callExprProp.comments
    };
    return [
      createMethodProp(
        j,
        functionExpr,
        createInstancePropDecorators(j, callExprProp)
      )
    ];
  } else if (lastArgType === "ObjectExpression") {
    const callExprMethods = callExprLastArg.properties.map(callExprFunction => {
      callExprFunction.kind = getPropName(callExprFunction);
      callExprFunction.key = callExprProp.key;
      callExprFunction.value.params.shift();
      return createMethodProp(j, callExprFunction);
    });

    withDecorators(
      withComments(callExprMethods[0], callExprProp),
      createInstancePropDecorators(j, callExprProp)
    );
    return callExprMethods;
  } else {
    return [createClassProp(j, callExprProp)];
  }
}

/**
 * Create identifier for super class with mixins
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} superClassName
 * @param {Expression[]} mixins
 * @returns {Identifier}
 */
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
 *  instanceProps: EOProp[],
 * } ember object properties
 * @param {String} superClassName
 * @param {Expression[]} mixins
 * @returns {ClassDeclaration}
 */
function createClass(
  j,
  className,
  { instanceProps = [] } = {},
  superClassName = "",
  mixins = []
) {
  let classBody = [];
  let classDecorators = [];
  instanceProps.forEach(prop => {
    if (prop.isClassDecorator) {
      classDecorators.push(createClassDecorator(j, prop));
    } else if (prop.type === "FunctionExpression") {
      classBody.push(createMethodProp(j, prop));
    } else if (prop.isCallExpression) {
      classBody = classBody.concat(createCallExpressionProp(j, prop));
    } else if (prop.name === "actions") {
      classBody = classBody.concat(createActionDecoratedProps(j, prop));
    } else {
      classBody.push(createClassProp(j, prop));
    }
  });
  return withDecorators(
    j.classDeclaration(
      className ? j.identifier(className) : null,
      j.classBody(classBody),
      createSuperClassExpression(j, superClassName, mixins)
    ),
    classDecorators
  );
}
/**
 * Create import statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {ImportSpecifier[]} specifiers
 * @param {String} path
 * @returns {ImportDeclaration}
 */
function createImportDeclaration(j, specifiers, path) {
  return j.importDeclaration(specifiers, j.literal(path));
}

/**
 * Matches the decorators for the current path with the `decoratorsToImport`,
 * and creates import specifiers for the matching decorators
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String[]} pathSpecifiers
 * @param {String[]} decoratorsToImport
 * @returns {ImportSpecifier}
 */
function createEmberDecoratorSpecifiers(
  j,
  pathSpecifiers = [],
  decoratorsToImport = []
) {
  return pathSpecifiers
    .filter(specifier => decoratorsToImport.includes(specifier))
    .map(specifier => {
      return j.importSpecifier(
        j.identifier(specifier),
        j.identifier(specifier)
      );
    });
}

module.exports = {
  withComments,
  instancePropsToExpressions,
  createSuperExpressionStatement,
  createConstructor,
  createClass,
  createImportDeclaration,
  createEmberDecoratorSpecifiers
};
