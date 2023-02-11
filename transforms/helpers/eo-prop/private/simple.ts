import { default as j } from 'jscodeshift';
import type { ClassProperty, Decorator, EOPropertySimple } from '../../ast';
import { createDecoratorWithArgs } from '../../decorator-helper';
import logger from '../../log-helper';
import AbstractEOProp from './abstract';

export default class EOSimpleProp extends AbstractEOProp<
  EOPropertySimple,
  ClassProperty
> {
  override build(): ClassProperty {
    const classProp = j.classProperty.from({
      key: this.key,
      value: this.hasDecorators ? null : this.value,
      comments: this.comments,
      computed: this.computed,
    });

    // @ts-expect-error jscodeshift AST types are incorrect
    // If this ever gets fixed, check if the builder `.from` method above
    // will now take a decorators param.
    classProp.decorators = this.buildDecorators();

    return classProp;
  }

  protected override supportsObjectLiteralDecorators = true;

  get value(): EOPropertySimple['value'] {
    return this._prop.value;
  }

  protected buildDecorators(): Decorator[] {
    const decorators: Decorator[] = [];
    for (const decorator of this.decorators) {
      const decoratorName = decorator.name;
      if ('args' in decorator) {
        decorators.push(createDecoratorWithArgs(decoratorName, decorator.args));
      } else {
        logger.info(`[${this.name}] Ignored decorator ${decoratorName}`);
      }
    }

    return [...(this.existingDecorators ?? []), ...decorators];
  }

  protected override get _errors(): string[] {
    const errors: string[] = [];
    const { classFields } = this.options;

    if (!classFields) {
      errors.push(this.makeError("need option '--class-fields=true'"));
    }

    if (
      (this.type === 'ObjectExpression' || this.type === 'ArrayExpression') &&
      this.name !== 'queryParams'
    ) {
      errors.push(
        this.makeError(
          'value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects'
        )
      );
    }

    return errors;
  }
}
