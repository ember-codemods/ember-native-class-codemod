import type { Decorator, JSCodeshift } from 'jscodeshift';
import type EOProp from './eo-prop';
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

/** FIXME: Document */
export function createClassDecorator(
  j: JSCodeshift,
  classDecoratorProp: EOProp
): Decorator {
  const decoratorArgs =
    classDecoratorProp.type === 'ArrayExpression'
      ? // @ts-expect-error
        classDecoratorProp.value.elements
      : [classDecoratorProp.value];

  return j.decorator(
    j.callExpression(j.identifier(classDecoratorProp.classDecoratorName), [
      ...decoratorArgs,
    ])
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
): Decorator[] {
  if (instanceProp.isVolatileReadOnly) {
    return [];
  }

  const decoratorArgs = instanceProp.shouldRemoveLastArg
    ? instanceProp.callExprArgs.slice(0, -1)
    : // eslint-disable-next-line unicorn/prefer-spread
      instanceProp.callExprArgs.slice(0);

  let decoratorExpression =
    ['computed', 'service', 'controller'].includes(decoratorName) &&
    decoratorArgs.length === 0
      ? j.identifier(decoratorName)
      : j.callExpression(j.identifier(decoratorName), decoratorArgs);

  for (const modifier of instanceProp.modifiers) {
    decoratorExpression = j.callExpression(
      // @ts-expect-error
      j.memberExpression(decoratorExpression, modifier.prop),
      modifier.args
    );
  }

  if (instanceProp.modifiers.length === 0) {
    return [j.decorator(decoratorExpression)];
  }

  // If has modifiers wrap decorators in anonymous call expression
  // it transforms @computed('').readOnly() => @(computed('').readOnly())
  return [
    j.decorator(j.callExpression(j.identifier(''), [decoratorExpression])),
  ];
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
export function createIdentifierDecorators(
  j: JSCodeshift,
  identifier = 'action'
): [Decorator] {
  return [j.decorator(j.identifier(identifier))];
}

/**
 * Create decorators for props from `classNameBindings` and `attributeBindings`
 */
function createBindingDecorators(
  j: JSCodeshift,
  decoratorName: string,
  instanceProp: EOProp
): [Decorator] {
  const propList = get(instanceProp, 'propList');
  if (propList && propList.length > 0) {
    // @ts-expect-error
    const propArgs = propList.map((prop) => j.literal(prop));
    return [
      j.decorator(j.callExpression(j.identifier(decoratorName), propArgs)),
    ];
  }
  return [j.decorator(j.identifier(decoratorName))];
}

/** Handles decorators for instance properties */
export function createInstancePropDecorators(
  j: JSCodeshift,
  instanceProp: EOProp
): Decorator[] {
  let decorators: Decorator[] = [];
  for (const decorator of instanceProp.decoratorNames) {
    if (decorator === 'className' || decorator === 'attribute') {
      decorators = [
        ...decorators,
        ...createBindingDecorators(j, decorator, instanceProp),
      ];
    } else if (decorator === 'off' || decorator === 'unobserves') {
      decorators = [
        ...decorators,
        ...createDecoratorsWithArgs(
          j,
          decorator,
          defined(instanceProp.decoratorArgs[decorator])
        ),
      ];
    } else if (decorator) {
      decorators = [
        ...decorators,
        ...createCallExpressionDecorators(j, decorator, instanceProp),
      ];
    }
  }
  return decorators;
}
