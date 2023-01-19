import type { FunctionExpression, Identifier, Property } from 'jscodeshift';
import AbstractEOProp from './abstract';

export type FunctionExpressionProperty = Property & {
  value: FunctionExpression;
  key: Identifier;
};

/** Type predicate */
export function isFunctionExpressionProperty(
  property: Property
): property is FunctionExpressionProperty {
  return property.value.type === 'FunctionExpression';
}

export default class EOFunctionExpressionProp extends AbstractEOProp<
  FunctionExpression,
  FunctionExpressionProperty
> {}
