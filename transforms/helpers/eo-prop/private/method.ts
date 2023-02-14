import { default as j } from 'jscodeshift';
import type * as AST from '../../ast';
import { replaceMethodSuperExpression } from '../../transform-helper';
import AbstractEOProp from './abstract';

/**
 * Ember Object Method
 *
 * A wrapper object for Ember Object methods (including getters and setters) to
 * be transformed into `ClassMethod`s.
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   get myGetter() {},
 *
 *   myMethod() {
 *     this._super(...arguments);
 *   }
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * class MyObject extends EmberObject {
 *   get myGetter() {}
 *
 *   myMethod() {
 *     super.myMethod(...arguments);
 *   }
 * }
 * ```
 *
 * @see EOFunctionExpressionProp
 */
export default class EOMethod extends AbstractEOProp<
  AST.EOMethod,
  AST.ClassMethod
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp;

  protected override readonly supportsObjectLiteralDecorators = true;

  build(): AST.ClassMethod {
    return replaceMethodSuperExpression(
      j.classMethod.from({
        kind: this.kind,
        key: this.key,
        params: this.params,
        body: this.body,
        comments: this.comments,
        decorators: this.existingDecorators,
      }),
      this.replaceSuperWithUndefined
    );
  }

  protected get kind(): 'get' | 'set' | 'method' {
    return this.value.kind;
  }

  protected get params(): AST.EOMethod['params'] {
    return this.value.params;
  }

  protected get body(): AST.EOMethod['body'] {
    return this.value.body;
  }
}
