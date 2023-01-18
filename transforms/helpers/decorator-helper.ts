import type { Decorator, JSCodeshift } from 'jscodeshift';
import type { EOBaseProp, EOClassDecoratorProp } from './eo-prop';
import EOCallExpressionProp from './eo-prop/private/call-expression';
import { assert, defined } from './util/types';

/** Copy decorators `from` => `to` */
export function withDecorators<T>(to: T, decorators: Decorator[] = []): T {
  if (decorators.length > 0) {
    // @ts-expect-error
    to.decorators = decorators;
  }
  return to;
}

type CallExpressionArg = Parameters<JSCodeshift['callExpression']>[1][number];
// type CallExpressionArgType = CallExpressionArg['type'];

/** FIXME: Document */
export function createClassDecorator(
  j: JSCodeshift,
  classDecoratorProp: EOClassDecoratorProp
): Decorator {
  const { value } = classDecoratorProp;
  const decoratorArgs =
    value.type === 'ArrayExpression' ? value.elements : [value];

  // FIXME: Assert that the cast below is correct

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
export function createCallExpressionDecorators(
  j: JSCodeshift,
  decoratorName: string,
  instanceProp: EOCallExpressionProp
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
  decoratorName: string
): [Decorator] {
  return [j.decorator(j.identifier(decoratorName))];
}

/** Handles decorators for instance properties */
export function createInstancePropDecorators(
  j: JSCodeshift,
  instanceProp: EOCallExpressionProp | EOBaseProp
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
