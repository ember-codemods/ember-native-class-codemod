import { default as j } from 'jscodeshift';
import type { ClassProperty, Decorator, EOPropertySimple } from '../../ast';
import { createInstancePropDecorators } from '../../decorator-helper';
import AbstractEOProp from './abstract';

export default class EOSimpleProp extends AbstractEOProp<
  EOPropertySimple,
  ClassProperty
> {
  override build(): ClassProperty {
    const classProp = j.classProperty.from({
      key: this.key,
      value: this.shouldSetValue ? this.value : null,
      comments: this.comments ?? null,
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

  // FIXME: Is this still shared with EOCallExpressionProp?
  private get shouldSetValue(): boolean {
    // TODO: This is probably where we can remove the = undefined value;
    return (
      !this.hasDecorators ||
      this.decoratorNames.every(
        (name) => name === 'className' || name === 'attribute'
      )
    );
  }

  // FIXME: Is this still shared with EOCallExpressionProp?
  private buildDecorators(): Decorator[] {
    // FIXME: Clean up; Move in-house?
    const decorators = createInstancePropDecorators(j, this);
    const allDecorators = new Set<Decorator>([
      ...(this.existingDecorators ?? []),
      ...decorators,
    ]);
    return [...allDecorators];
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
