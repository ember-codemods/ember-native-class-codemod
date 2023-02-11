import { default as j } from 'jscodeshift';
import type { ClassMethod, EOPropertyWithFunctionExpression } from '../../ast';
import { replaceMethodSuperExpression } from '../../transform-helper';
import AbstractEOProp from './abstract';

export default class EOFunctionExpressionProp extends AbstractEOProp<
  EOPropertyWithFunctionExpression,
  ClassMethod
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp.value;

  protected override readonly supportsObjectLiteralDecorators = true;

  /**
   * Transform functions to class methods
   *
   * For example { foo: function() { }} --> { foo() { }}
   */
  build(): ClassMethod {
    return replaceMethodSuperExpression(
      j.classMethod.from({
        kind: 'method',
        key: this.key,
        params: this.value.params,
        body: this.value.body,
        comments: this.comments,
        decorators: this.existingDecorators,
      }),
      this.replaceSuperWithUndefined
    );
  }
}
