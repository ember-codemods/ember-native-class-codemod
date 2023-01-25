import type { EOPropertyForClassDecorator } from '../../ast';
import {
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from '../../util/index';
import AbstractEOProp from './abstract';

export default class EOClassDecoratorProp extends AbstractEOProp<EOPropertyForClassDecorator> {
  get value(): EOPropertyForClassDecorator['value'] {
    return this._prop.value;
  }

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
