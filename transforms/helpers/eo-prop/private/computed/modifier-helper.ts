import type * as AST from '../../../ast';

export interface CallExpressionModifier {
  prop:
    | Extract<AST.EOCallExpression['callee'], { property: unknown }>['property']
    | undefined;
  args: AST.EOCallExpression['arguments'];
}

/**
 * Get property modifier from the property callee object
 */
export function getModifier(
  calleeObject: AST.EOCallExpression
): CallExpressionModifier {
  return {
    prop:
      'property' in calleeObject.callee
        ? calleeObject.callee.property
        : undefined,
    args: calleeObject.arguments,
  };
}
