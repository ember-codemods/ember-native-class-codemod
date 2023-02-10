import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import type { Decorator } from './ast';
import type { EOClassDecorator, EOSimpleProp } from './eo-prop/index';
import { EOCallExpressionProp } from './eo-prop/index';
import { assert, defined } from './util/types';

type CallExpressionArg = Parameters<JSCodeshift['callExpression']>[1][number];

/** Creates a decorator for a class. */
export function createClassDecorator(
  j: JSCodeshift,
  classDecoratorProp: EOClassDecorator
): Decorator {
  const { value } = classDecoratorProp;
  const decoratorArgs =
    value.type === 'ArrayExpression' ? value.elements : [value];

  return j.decorator(
    j.callExpression(j.identifier(classDecoratorProp.classDecoratorName), [
      ...decoratorArgs,
    ] as CallExpressionArg[])
  );
}

/**
 * Create decorators for computed properties and methods
 * This method handles decorators for `DECORATOR_PROPS` defined in `util.js`
 */
function createCallExpressionDecorators(
  j: JSCodeshift,
  decoratorName: string,
  instanceProp: EOCallExpressionProp
): Decorator[] {
  if (instanceProp.isVolatileReadOnly) {
    return [];
  }

  const decoratorArgs = instanceProp.shouldRemoveLastArg
    ? instanceProp.arguments.slice(0, -1)
    : // eslint-disable-next-line unicorn/prefer-spread
      instanceProp.arguments.slice(0);

  let decoratorExpression =
    ['computed', 'service', 'controller'].includes(decoratorName) &&
    decoratorArgs.length === 0
      ? j.identifier(decoratorName)
      : j.callExpression(j.identifier(decoratorName), decoratorArgs);

  for (const modifier of instanceProp.modifiers) {
    assert(modifier.prop);
    decoratorExpression = j.callExpression(
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
export function buildActionDecorator(): [Decorator] {
  return [j.decorator(j.identifier('action'))];
}

/**
 * Create decorators for props from `classNameBindings` and `attributeBindings`
 */
function createBindingDecorators(
  j: JSCodeshift,
  decoratorName: string
): [Decorator] {
  return [j.decorator(j.identifier(decoratorName))];
}

/** Handles decorators for instance properties */
export function createInstancePropDecorators(
  j: JSCodeshift,
  instanceProp: EOCallExpressionProp | EOSimpleProp
): Decorator[] {
  let decorators: Decorator[] = [];
  for (const decorator of instanceProp.decoratorNames) {
    if (decorator === 'className' || decorator === 'attribute') {
      decorators = [...decorators, ...createBindingDecorators(j, decorator)];
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
      assert(instanceProp instanceof EOCallExpressionProp);
      decorators = [
        ...decorators,
        ...createCallExpressionDecorators(j, decorator, instanceProp),
      ];
    }
  }
  return decorators;
}
