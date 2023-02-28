import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import type * as AST from '../helpers/ast';

type CallExpressionArg = Parameters<JSCodeshift['callExpression']>[1][number];

/** Creates a decorator for a class. */
export function createClassDecorator(
  decoratorName: string,
  value: CallExpressionArg
): AST.Decorator {
  const args = value.type === 'ArrayExpression' ? value.elements : [value];
  return j.decorator(
    j.callExpression(j.identifier(decoratorName), args as CallExpressionArg[])
  );
}

/** Create decorators which need arguments. */
export function createDecoratorWithArgs(
  decoratorName: string,
  args: Array<string | number | boolean | RegExp | null>
): AST.Decorator {
  return j.decorator(
    j.callExpression(
      j.identifier(decoratorName),
      args.map((arg) => j.literal(arg))
    )
  );
}

/** Create simple decorator with given name. */
export function createIdentifierDecorator(
  decoratorName: string
): AST.Decorator {
  return j.decorator(j.identifier(decoratorName));
}
