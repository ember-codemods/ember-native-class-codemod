import type {
  ArrayExpression,
  Identifier,
  Literal,
  Property,
} from 'jscodeshift';
import EOProp from './base';
import { getPropName } from '../../util/index';

export type ClassDecoratorProperty = Property & {
  value: Literal | ArrayExpression | Identifier;
};

// FIXME: Switch more of the `includes` checks to this style.
const ClassDecoratorPropNames = new Set([
  'layout',
  'tagName',
  'classNames',
  'classNameBindings',
  'attributeBindings',
]);

/** Type predicate */
export function isClassDecoratorProperty(
  property: Property
): property is ClassDecoratorProperty {
  const name = getPropName(property);
  return ClassDecoratorPropNames.has(name);
}

export default class EOClassDecoratorProp extends EOProp<
  Literal | ArrayExpression | Identifier
> {}
