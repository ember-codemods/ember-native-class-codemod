import type { FunctionExpression, Property } from 'jscodeshift';
import AbstractEOProp from './abstract';

export type FunctionExpressionProperty = Property & {
  value: FunctionExpression;
};

/** Type predicate */
export function isFunctionExpressionProperty(
  property: Property
): property is FunctionExpressionProperty {
  return property.value.type === 'FunctionExpression';
}

export default class EOFunctionExpressionProp extends AbstractEOProp<FunctionExpression> {}
