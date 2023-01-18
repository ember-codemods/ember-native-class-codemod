import type { FunctionExpression, Property } from 'jscodeshift';
import EOProp from './base';

export type FunctionExpressionProperty = Property & {
  value: FunctionExpression;
};

/** Type predicate */
export function isFunctionExpressionProperty(
  property: Property
): property is FunctionExpressionProperty {
  return property.value.type === 'FunctionExpression';
}

export default class EOFunctionExpressionProp extends EOProp<FunctionExpression> {}
