import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import type { Decorator } from './ast';
import type { EOClassDecorator } from './eo-prop/index';

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

/** Create decorators which need arguments */
export function createDecoratorWithArgs(
  decoratorName: string,
  args: Array<string | number | boolean | RegExp | null>
): Decorator {
  return j.decorator(
    j.callExpression(
      j.identifier(decoratorName),
      args.map((arg) => j.literal(arg))
    )
  );
}

/** Create `@action` decorator */
export function buildActionDecorator(): [Decorator] {
  return [createIdentifierDecorator('action')];
}

/**
 * Create simple decorator with given name
 */
export function createIdentifierDecorator(decoratorName: string): Decorator {
  return j.decorator(j.identifier(decoratorName));
}
