import type { Decorator, JSCodeshift } from 'jscodeshift';
import type EOProp from './EOProp';
import { get } from './util';
import { defined } from './util/types';

/** Copy decorators `from` => `to` */
export function withDecorators<T>(to: T, decorators: Decorator[] = []): T {
  if (decorators.length > 0) {
    // @ts-expect-error
    to.decorators = decorators;
  }
  return to;
}

export function createClassDecorator(j: JSCodeshift, classDecoratorProp: EOProp): Decorator {
  let decoratorArgs = [];
  if (classDecoratorProp.type === 'ArrayExpression') {
    // @ts-expect-error
    decoratorArgs = classDecoratorProp.value.elements;
  } else {
    decoratorArgs = [classDecoratorProp.value];
  }
  return j.decorator(
    j.callExpression(j.identifier(classDecoratorProp.classDecoratorName), [...decoratorArgs])
  );
}

/**
 * Create decorators for computed properties and methods
 * This method handles decorators for `DECORATOR_PROPS` defined in `util.js`
 */
export function createCallExpressionDecorators(
  j: JSCodeshift,
  decoratorName: string,
  instanceProp: EOProp
): Decorator | Decorator[] {
  if (instanceProp.isVolatileReadOnly) {
    return [];
  }

  const decoratorArgs = instanceProp.shouldRemoveLastArg
    ? instanceProp.callExprArgs.slice(0, -1)
    : instanceProp.callExprArgs.slice(0);

  let decoratorExpression =
    ['computed', 'service', 'controller'].includes(decoratorName) && decoratorArgs.length === 0
      ? j.identifier(decoratorName)
      : j.callExpression(j.identifier(decoratorName), decoratorArgs);

  decoratorExpression = instanceProp.modifiers.reduce(
    (callExpr, modifier) =>
      // @ts-expect-error
      j.callExpression(j.memberExpression(callExpr, modifier.prop), modifier.args),
    decoratorExpression
  );

  if (!instanceProp.modifiers.length) {
    return j.decorator(decoratorExpression);
  }

  // If has modifiers wrap decorators in anonymous call expression
  // it transforms @computed('').readOnly() => @(computed('').readOnly())
  return j.decorator(j.callExpression(j.identifier(''), [decoratorExpression]));
}

/** Create decorators which need arguments */
function createDecoratorsWithArgs(
  j: JSCodeshift,
  identifier: string,
  args: Array<string | number | boolean | RegExp | null>
): [Decorator] {
  return [
    j.decorator(
      j.callExpression(
        j.identifier(identifier),
        args.map((arg) => j.literal(arg))
      )
    ),
  ];
}

/** Create `@action` decorator */
export function createIdentifierDecorators(j: JSCodeshift, identifier = 'action'): [Decorator] {
  return [j.decorator(j.identifier(identifier))];
}

/**
 * Create decorators for props from `classNameBindings` and `attributeBindings`
 */
// @ts-expect-error
function createBindingDecorators(j: JSCodeshift, decoratorName: string, instanceProp): [Decorator] {
  const propList = get(instanceProp, 'propList');
  if (propList && propList.length) {
    // @ts-expect-error
    const propArgs = propList.map((prop) => j.literal(prop));
    return [j.decorator(j.callExpression(j.identifier(decoratorName), propArgs))];
  }
  return [j.decorator(j.identifier(decoratorName))];
}

/** Handles decorators for instance properties */
export function createInstancePropDecorators(j: JSCodeshift, instanceProp: EOProp): Decorator[] {
  return instanceProp.decoratorNames.reduce((decorators, decorator) => {
    if (!decorator) {
      return decorators;
    }
    if (decorator === 'className' || decorator === 'attribute') {
      return decorators.concat(createBindingDecorators(j, decorator, instanceProp));
    }
    if (decorator === 'off' || decorator === 'unobserves') {
      return decorators.concat(
        createDecoratorsWithArgs(j, decorator, defined(instanceProp.decoratorArgs[decorator]))
      );
    }
    return decorators.concat(createCallExpressionDecorators(j, decorator, instanceProp));
  }, [] as Decorator[]);
}
