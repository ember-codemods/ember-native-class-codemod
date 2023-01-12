const {
  ACTION_SUPER_EXPRESSION_COMMENT,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
  get,
  getPropName,
} = require('./util');
const {
  withDecorators,
  createClassDecorator,
  createInstancePropDecorators,
  createIdentifierDecorators,
} = require('./decorator-helper');

/**
 * Returns true if class property should have value
 *
 * @param {EOProp} prop
 * @returns {Boolean}
 */
function shouldSetValue(prop) {
  if (!prop.hasDecorators) {
    return true;
  }
  return prop.decoratorNames.every(
    (decoratorName) => decoratorName === 'className' || decoratorName === 'attribute'
  );
}

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
 * Creates line comments from passed lines
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String[]} lines line comments
 * @returns {CommentLine[]}
 */
function createLineComments(j, lines = []) {
  return lines.map((line) => j.commentLine(line));
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
  return instanceProps.map((instanceProp) =>
    withComments(
      j.expressionStatement(
        j.assignmentExpression(
          '=',
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
 * @param {MethodDefinition} methodDefinition - MethodDefinition to replace instances from
 * @param {FunctionExpression|EOProp} functionProp - Function expression to get the runtime data
 * @returns {MethodDefinition}
 */
function replaceSuperExpressions(j, methodDefinition, functionProp) {
  const replaceWithUndefined = functionProp.hasRuntimeData ? !functionProp.isOverridden : false;
  const superExprs = j(methodDefinition).find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      property: {
        type: 'Identifier',
        name: '_super',
      },
    },
  });

  if (!superExprs.length) {
    return methodDefinition;
  }
  superExprs.forEach((superExpr) => {
    if (replaceWithUndefined) {
      j(superExpr).replaceWith(j.identifier('undefined'));
    } else {
      let superMethodCall;
      const superMethodArgs = get(superExpr, 'value.arguments') || [];
      if (functionProp.isComputed) {
        superMethodCall = j.memberExpression(j.super(), functionProp.key);
      } else if (functionProp.isAction) {
        superMethodCall = j.callExpression(
          j.memberExpression(
            j.memberExpression(
              j.memberExpression(j.super(), j.identifier('actions')),
              methodDefinition.key
            ),
            j.identifier('call')
          ),
          [].concat(j.thisExpression(), ...superMethodArgs)
        );
        superMethodCall.comments = createLineComments(j, ACTION_SUPER_EXPRESSION_COMMENT);
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
 * @returns {MethodDefinition}
 */
function createMethodProp(j, functionProp, decorators = []) {
  const propKind = functionProp.kind === 'init' ? 'method' : functionProp.kind;

  return withDecorators(
    withComments(
      replaceSuperExpressions(
        j,
        j.methodDefinition(propKind, functionProp.key, functionProp.value),
        functionProp
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
        'constructor',
        j.identifier('constructor'),
        j.functionExpression(
          null,
          [],
          j.blockStatement(
            [createSuperExpressionStatement(j)].concat(instancePropsToExpressions(j, instanceProps))
          )
        )
      ),
    ];
  }
  return [];
}

/**
 * Create the class property from passed instance property
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp} instanceProp
 * @param {Decorator[]} decorators
 * @returns {ClassProperty}
 */
function createClassProp(j, instanceProp, decorators = []) {
  if (!decorators.length) {
    decorators = createInstancePropDecorators(j, instanceProp);
  }

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
 * Actions with identifier converted to method definition
 *
 * For example in case of following action
 * ```
 * import someActionUtil from 'some/action/util';
 *
 * const Foo = Component.extend({
 *   actions: {
 *     someActionUtil
 *   }
 * });
 * ```
 *
 * will be transformed to:
 *
 * ```
 * import someActionUtil from 'some/action/util';
 *
 * const Foo = Component.extend({
 *   @action
 *   someActionUtil() {
 *     return someActionUtil.call(this, ...arguments);
 *   }
 * });
 * ```
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp} idAction
 * @param {Decorator[]} decorators
 * @returns {MethodDefinition}
 */
function convertIdentifierActionToMethod(j, idAction, decorators = []) {
  const returnBlock = j.blockStatement([
    j.returnStatement(
      j.callExpression(j.memberExpression(idAction.value, j.identifier('call')), [
        j.thisExpression(),
        j.spreadElement(j.identifier('arguments')),
      ])
    ),
  ]);
  const expr = j.functionExpression(null, [], returnBlock);

  return withDecorators(
    withComments(j.methodDefinition('method', idAction.key, expr), idAction),
    decorators
  );
}

/**
 * Create action decorators
 * ```
 * Converts
 * {
 *  actions: {
 *    foo() {}
 *  }
 * }
 * ```
 * to
 * ```
 * {
 *  @action
 *  foo(){ }
 * }
 * ```
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp} actionsProp
 * @returns {MethodDefinition[]}
 */
function createActionDecoratedProps(j, actionsProp) {
  const actionProps = get(actionsProp, 'value.properties');
  const overriddenActions = get(actionsProp, 'overriddenActions') || [];
  const actionDecorators = createIdentifierDecorators(j);
  return actionProps.map((actionProp) => {
    if (get(actionProp, 'value.type') === 'Identifier') {
      return convertIdentifierActionToMethod(j, actionProp, actionDecorators);
    } else {
      actionProp.isAction = true;
      actionProp.hasRuntimeData = actionsProp.hasRuntimeData;
      actionProp.isOverridden = overriddenActions.includes(actionProp.key.name);
      return createMethodProp(j, actionProp, actionDecorators);
    }
  });
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
  let callExprLastArg;
  if (callExprProp.shouldRemoveLastArg) {
    callExprLastArg = callExprArgs.pop();
  }

  const lastArgType = get(callExprLastArg, 'type');

  if (callExprProp.shouldRemoveLastArg) {
    if (lastArgType === 'FunctionExpression') {
      const functionExpr = {
        isComputed: true,
        kind: callExprProp.kind,
        key: callExprProp.key,
        value: callExprLastArg,
        comments: callExprProp.comments,
      };
      return [createMethodProp(j, functionExpr, createInstancePropDecorators(j, callExprProp))];
    } else if (lastArgType === 'ObjectExpression') {
      const callExprMethods = callExprLastArg.properties.map((callExprFunction) => {
        callExprFunction.isComputed = true;
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
    }
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
function createSuperClassExpression(j, superClassName = '', mixins = []) {
  if (mixins.length > 0) {
    return j.callExpression(
      j.memberExpression(j.identifier(superClassName), j.identifier('extend')),
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
  superClassName = '',
  mixins = [],
  options
) {
  let classBody = [];
  let classDecorators = [];

  if (options.classicDecorator) {
    classDecorators.push(j.decorator(j.identifier('classic')));
  }

  instanceProps.forEach((prop) => {
    if (prop.isClassDecorator) {
      classDecorators.push(createClassDecorator(j, prop));
    } else if (prop.type === 'FunctionExpression') {
      classBody.push(createMethodProp(j, prop));
    } else if (prop.isCallExpression) {
      classBody = classBody.concat(createCallExpressionProp(j, prop));
    } else if (prop.name === 'actions') {
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
 * @returns {ImportSpecifier[]}
 */
function createEmberDecoratorSpecifiers(j, pathSpecifiers = [], decoratorsToImport = []) {
  return pathSpecifiers
    .filter((specifier) => decoratorsToImport.includes(specifier))
    .map((specifier) => {
      const importedSpecifier =
        specifier === LAYOUT_DECORATOR_LOCAL_NAME ? LAYOUT_DECORATOR_NAME : specifier;
      return j.importSpecifier(j.identifier(importedSpecifier), j.identifier(specifier));
    });
}

module.exports = {
  withComments,
  instancePropsToExpressions,
  createSuperExpressionStatement,
  createConstructor,
  createClass,
  createImportDeclaration,
  createEmberDecoratorSpecifiers,
};
