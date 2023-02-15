import { default as j } from 'jscodeshift';
import type * as AST from '../../ast';
import { createDecoratorWithArgs } from '../../decorator-helper';
import logger from '../../log-helper';
import AbstractEOProp from './abstract';

/**
 * Ember Object Simple Property
 *
 * A wrapper object for Ember Object properties not captured by the other
 * `EOProp`/`EOClassDecorator` classes to be transformed into
 * `ClassProperties`s.
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   prop: 'defaultValue',
 *   boolProp: true,
 *   numProp: 123,
 *   [MY_VAL]: 'val',
 *   queryParams: {},
 *   someVal,
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * class MyObject extends EmberObject {
 *   prop = 'defaultValue';
 *   boolProp = true;
 *   numProp = 123;
 *   [MY_VAL] = 'val';
 *   queryParams = {};
 *   someVal = someVal;
 * }
 * ```
 */
export default class EOSimpleProp extends AbstractEOProp<
  AST.EOSimpleProp,
  AST.ClassProperty
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp.value;

  protected override readonly supportsObjectLiteralDecorators = true;

  build(): AST.ClassProperty {
    const classProp = j.classProperty.from({
      key: this.key,
      value: this.hasDecorators ? null : this.value,
      comments: this.comments,
      computed: this.rawProp.computed ?? false,
    });

    // @ts-expect-error jscodeshift AST types are incorrect
    // If this ever gets fixed, check if the builder `.from` method above
    // will now take a decorators param.
    classProp.decorators = this.buildDecorators();

    return classProp;
  }

  protected override get typeErrors(): string[] {
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

  private buildDecorators(): AST.Decorator[] {
    const decorators: AST.Decorator[] = [];
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
}
