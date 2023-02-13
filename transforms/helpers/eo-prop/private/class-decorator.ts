import type * as AST from '../../ast';
import { createClassDecorator } from '../../decorator-helper';
import type { DecoratorImportSpecs } from '../../parse-helper';
import {
  ATTRIBUTE_BINDINGS_DECORATOR_NAME,
  CLASS_NAMES_DECORATOR_NAME,
  CLASS_NAME_BINDINGS_DECORATOR_NAME,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
  TAG_NAME_DECORATOR_NAME,
} from '../../util/index';
import AbstractEOProp from './abstract';

/**
 * Ember Object Class Decorator
 *
 * A wrapper object for ember object properties that should be converted into
 * class decorators, including:
 * - `@classNames`
 * - `@attributeBindings`
 * - `@classNameBindings`
 * - `@layout`
 * - `@tagName`
 * - `@templateLayout`
 */
export default class EOClassDecorator extends AbstractEOProp<
  AST.EOClassDecoratorProp,
  AST.Decorator
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

  build(): AST.Decorator {
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
    return this.name === TAG_NAME_DECORATOR_NAME;
  }

  private get isClassNames(): boolean {
    return this.name === CLASS_NAMES_DECORATOR_NAME;
  }

  private get isClassNameBindings(): boolean {
    return this.name === CLASS_NAME_BINDINGS_DECORATOR_NAME;
  }

  private get isAttributeBindings(): boolean {
    return this.name === ATTRIBUTE_BINDINGS_DECORATOR_NAME;
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
