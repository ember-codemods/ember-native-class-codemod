import type {
  ArrayExpression,
  Identifier,
  Literal,
  MemberExpression,
  ObjectExpression,
  Property,
} from 'jscodeshift';
import AbstractEOProp from './abstract';

export type EOBaseProperty = Property & {
  value:
    | Literal
    | ObjectExpression
    | Identifier
    | ArrayExpression
    | MemberExpression;
};

/** Type predicate */
export function isEOProperty(property: Property): property is EOBaseProperty {
  return (
    property.value.type === 'Literal' ||
    property.value.type === 'ObjectExpression' ||
    property.value.type === 'Identifier' ||
    property.value.type === 'ArrayExpression' ||
    property.value.type === 'MemberExpression'
  );
}

export default class EOBaseProp extends AbstractEOProp<
  Literal | ObjectExpression | Identifier | ArrayExpression | MemberExpression,
  EOBaseProperty
> {}
