const { get } = require("./util");

/**
 * Copy decorators `from` => `to`
 * @param {Object} to
 * @param {Object} decorators
 * @returns {Object}
 */
function withDecorators(to, decorators = []) {
  if (decorators.length > 0) {
    to.decorators = decorators;
  }
  return to;
}

/**
 * Creates a list of class decorators `tagName` and `classNames`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property} classDecoratorProp
 * @returns {Decorator[]}
 */
function createClassDecorator(j, classDecoratorProp) {
  let decoratorArgs = [];
  if (classDecoratorProp.type === "ArrayExpression") {
    decoratorArgs = classDecoratorProp.value.elements;
  } else {
    decoratorArgs = [classDecoratorProp.value];
  }
  return j.decorator(
    j.callExpression(j.identifier(classDecoratorProp.classDecoratorName), [
      ...decoratorArgs
    ])
  );
}

/**
 * Create decorators for computed properties and methods
 * This method handles decorators for `DECORATOR_PROPS` defined in `util.js`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} decoratorName
 * @param {Property} instanceProp
 * @returns {Decorator[]}
 */
function createCallExpressionDecorators(j, decoratorName, instanceProp) {
  if (instanceProp.isVolatileReadOnly) {
    return [];
  }

  const decoratorArgs =
    !instanceProp.hasMapDecorator &&
    !instanceProp.hasFilterDecorator &&
    instanceProp.shouldRemoveLastArg
      ? instanceProp.callExprArgs.slice(0, -1)
      : instanceProp.callExprArgs.slice(0);

  const decoratorExpr = instanceProp.modifiers.reduce(
    (callExpr, modifier) =>
      j.callExpression(
        j.memberExpression(callExpr, modifier.prop),
        modifier.args
      ),
    j.callExpression(j.identifier(decoratorName), decoratorArgs)
  );

  if (!instanceProp.modifiers.length) {
    return j.decorator(decoratorExpr);
  }

  // If has modifiers wrap decorators in anonymous call expression
  // it transforms @computed('').readOnly() => @(computed('').readOnly())
  return j.decorator(j.callExpression(j.identifier(""), [decoratorExpr]));
}

/**
 * Create decorators which need arguments
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} identifier
 * @param {String[]} args
 * @returns {Decorator[]}
 */
function createDecoratorsWithArgs(j, identifier, args) {
  return [
    j.decorator(
      j.callExpression(
        j.identifier(identifier),
        args.map(arg => j.literal(arg))
      )
    )
  ];
}

/**
 * Create `@action` decorator
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} identifier
 * @returns {Decorator[]}
 */
function createIdentifierDecorators(j, identifier = "action") {
  return [j.decorator(j.identifier(identifier))];
}

/**
 * Create decorators for props from `classNameBindings` and `attributeBindings`
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {String} decoratorName
 * @param {Property[]} instanceProp
 * @returns {Decorator[]}
 */
function createBindingDecorators(j, decoratorName, instanceProp) {
  const propList = get(instanceProp, "propList");
  if (propList && propList.length) {
    const propArgs = propList.map(prop => j.literal(prop));
    return [
      j.decorator(j.callExpression(j.identifier(decoratorName), propArgs))
    ];
  }
  return [j.decorator(j.identifier(decoratorName))];
}

/**
 * Handles decorators for instance properties
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Property[]} instanceProp
 * @returns {Decorator[]}
 */
function createInstancePropDecorators(j, instanceProp) {
  return instanceProp.decoratorNames.reduce((decorators, decorator) => {
    if (!decorator) {
      return decorators;
    }
    if (decorator === "className" || decorator === "attribute") {
      return decorators.concat(
        createBindingDecorators(j, decorator, instanceProp)
      );
    }
    if (decorator === "off" || decorator === "unobserves") {
      return decorators.concat(
        createDecoratorsWithArgs(
          j,
          decorator,
          instanceProp.decoratorArgs[decorator]
        )
      );
    }
    return decorators.concat(
      createCallExpressionDecorators(j, decorator, instanceProp)
    );
  }, []);
}

module.exports = {
  withDecorators,
  createClassDecorator,
  createIdentifierDecorators,
  createCallExpressionDecorators,
  createInstancePropDecorators
};
