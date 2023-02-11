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
  readonly isClassDecorator = true as const;

  protected readonly value = this.rawProp.value;

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

  build(): Decorator {
    return createClassDecorator(this.classDecoratorName, this.value);
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  protected override get needsDecorators(): true {
    return true;
  }

  private get isLayoutDecorator(): boolean {
    return this.classDecoratorName === LAYOUT_DECORATOR_NAME;
  }

  private get isTemplateLayoutDecorator(): boolean {
    return this.classDecoratorName === LAYOUT_DECORATOR_LOCAL_NAME;
  }

  private get isTagName(): boolean {
    return this.name === 'tagName';
  }

  private get isClassNames(): boolean {
    return this.name === 'classNames';
  }

  private get isClassNameBindings(): boolean {
    return this.name === 'classNameBindings';
  }

  private get isAttributeBindings(): boolean {
    return this.name === 'attributeBindings';
  }

  private get classDecoratorName(): string {
    if (
      this.name === LAYOUT_DECORATOR_NAME &&
      'name' in this.value && // e.g. CallExpression doesn't have `name`
      this.value.name === LAYOUT_DECORATOR_NAME
    ) {
      return LAYOUT_DECORATOR_LOCAL_NAME;
    }
    return this.name;
  }
}
