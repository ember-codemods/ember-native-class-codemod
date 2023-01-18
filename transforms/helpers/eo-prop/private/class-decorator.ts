import type {
  ArrayExpression,
  Identifier,
  Literal,
  Property,
} from 'jscodeshift';
import EOProp from './base';

type ClassDecoratorPropertyValue = (Literal | ArrayExpression | Identifier) & {
  name: string;
};

export type ClassDecoratorProperty = Property & {
  value: ClassDecoratorPropertyValue;
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
  return (
    (property.value.type === 'Literal' ||
      property.value.type === 'ArrayExpression' ||
      property.value.type === 'Identifier') &&
    'name' in property.key &&
    typeof property.key.name === 'string' &&
    ClassDecoratorPropNames.has(property.key.name)
  );
}

export default class EOClassDecoratorProp extends EOProp<ClassDecoratorPropertyValue> {}
