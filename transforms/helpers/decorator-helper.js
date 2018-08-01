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
 * @param {Property[]} classDecoratorProps
 * @returns {Decorator[]}
 */
function createClassDecorators(j, classDecoratorProps = []) {
  return classDecoratorProps.map(classDecoratorProp => {
    return j.decorator(
      j.callExpression(j.identifier(classDecoratorProp.key.name), [
        classDecoratorProp.value
      ])
    );
  });
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
  if (decoratorName === "computed") {
    const decoratorArgs = get(instanceProp, "value.arguments").slice(0, -1);
    return [
      j.decorator(j.callExpression(j.identifier(decoratorName), decoratorArgs))
    ];
  } else {
    // clone the instance prop value
    const instancePropValue = JSON.parse(JSON.stringify(instanceProp.value));
    instancePropValue.callee.name = decoratorName;
    if (
      instanceProp.decoratorName &&
      get(instanceProp, "value.callee.object.callee.name")
    ) {
      const decoratorArgs = get(instancePropValue, "callee.object.arguments");
      instancePropValue.callee.object = get(
        instancePropValue,
        "callee.object.callee"
      );
      instancePropValue.arguments = decoratorArgs;
    }
    return [j.decorator(instancePropValue)];
  }
}

/**
 * Create `@action` decorator
 *
 * @param {Object} j - jscodeshift lib reference
 * @returns {Decorator[]}
 */
function createActionDecorators(j) {
  return [j.decorator(j.identifier("action"))];
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
  const decoratorName = instanceProp.decoratorName;
  if (!decoratorName) {
    return [];
  }
  if (decoratorName === "className" || decoratorName === "attribute") {
    return createBindingDecorators(j, decoratorName, instanceProp);
  }
  return createCallExpressionDecorators(j, decoratorName, instanceProp);
}

module.exports = {
  withDecorators,
  createClassDecorators,
  createActionDecorators,
  createCallExpressionDecorators,
  createInstancePropDecorators
};
