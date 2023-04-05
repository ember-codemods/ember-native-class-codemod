import { default as j } from 'jscodeshift';
import type * as AST from '../../ast';
import { replaceMethodSuperExpressions } from '../../transform-helper';
import AbstractEOProp from './abstract';

/**
 * Ember Object Function Expression Property
 *
 * A wrapper object for Ember Object properties with `FunctionExpression` values
 * to be transformed into `ClassMethod`s.
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   myMethod: () => {
 *     this._super(...arguments);
 *   }
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * class MyObject extends EmberObject {
 *   myMethod() {
 *     super.myMethod(...arguments);
 *   }
 * }
 * ```
 *
 * @see EOMethod
 */
export default class EOFunctionExpressionProp extends AbstractEOProp<
  AST.EOFunctionExpressionProp,
  AST.ClassMethod
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp.value;

  protected override readonly objectLiteralDecoratorSupport =
    'withVerification' as const;

  build(): AST.ClassMethod {
    return replaceMethodSuperExpressions(
      j.classMethod.from({
        kind: 'method',
        key: this.key,
        params: this.value.params,
        body: this.value.body,
        comments: this.comments,
        decorators: this.existingDecorators,
        generator: this.value.generator ?? false,
        async: this.value.async ?? false,
      }),
      this.replaceSuperWithUndefined
    );
  }
}
