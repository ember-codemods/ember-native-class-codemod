import type { Decorator, EOPropertyForClassDecorator } from '../../ast';
import { createClassDecorator } from '../../decorator-helper';
import type { DecoratorImportSpecs } from '../../parse-helper';
import {
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from '../../util/index';
import AbstractEOProp from './abstract';

export default class EOClassDecorator extends AbstractEOProp<
  EOPropertyForClassDecorator,
  Decorator
> {
  isClassDecorator = true;

  override build(): Decorator {
    return createClassDecorator(this.classDecoratorName, this.value);
  }

  override get decoratorImportSpecs(): DecoratorImportSpecs {
    return {
      ...super.decoratorImportSpecs,
      classNames: this.isClassNames,
      classNameBindings: this.isClassNameBindings,
      attributeBindings: this.isAttributeBindings,
      layout: this.isLayoutDecorator,
      templateLayout: this.isTemplateLayoutDecorator,
      tagName: this.isTagName,
    };
  }

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

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  protected override get needsDecorators(): boolean {
    return true;
  }
}
