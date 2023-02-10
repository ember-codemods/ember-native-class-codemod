import type { EOCallExpression } from '../../../ast';

export interface CallExpressionModifier {
  prop:
    | Extract<EOCallExpression['callee'], { property: unknown }>['property']
    | undefined;
  args: EOCallExpression['arguments'];
}

/**
 * Get property modifier from the property callee object
 */
export function getModifier(
  calleeObject: EOCallExpression
): CallExpressionModifier {
  return {
    prop:
      'property' in calleeObject.callee
        ? calleeObject.callee.property
        : undefined,
    args: calleeObject.arguments,
  };
}
