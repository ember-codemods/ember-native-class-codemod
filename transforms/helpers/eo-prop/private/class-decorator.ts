import type {
  ArrayExpression,
  Identifier,
  Literal,
  Property,
} from 'jscodeshift';
import {
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from '../../util/index';
import AbstractEOProp from './abstract';

type ClassDecoratorPropertyValue = (Literal | ArrayExpression | Identifier) & {
  name: string;
};

export type ClassDecoratorProperty = Property & {
  value: ClassDecoratorPropertyValue;
};

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

export default class EOClassDecoratorProp extends AbstractEOProp<ClassDecoratorPropertyValue> {
  get classDecoratorName(): string {
    if (
      this.name === LAYOUT_DECORATOR_NAME &&
      'name' in this.value && // e.g. CallExpression doesn't have `name`
      this.value.name === LAYOUT_DECORATOR_NAME
    ) {
      return LAYOUT_DECORATOR_LOCAL_NAME;
    }
    return this.name;
  }

  get isLayoutDecorator(): boolean {
    return this.classDecoratorName === LAYOUT_DECORATOR_NAME;
  }

  get isTemplateLayoutDecorator(): boolean {
    return this.classDecoratorName === LAYOUT_DECORATOR_LOCAL_NAME;
  }

  get isTagName(): boolean {
    return this.name === 'tagName';
  }

  get isClassNames(): boolean {
    return this.name === 'classNames';
  }

  get isClassNameBindings(): boolean {
    return this.name === 'classNameBindings';
  }

  get isAttributeBindings(): boolean {
    return this.name === 'attributeBindings';
  }
}
