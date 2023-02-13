import { default as j } from 'jscodeshift';
import type * as AST from '../../ast';
import { replaceMethodSuperExpression } from '../../transform-helper';
import AbstractEOProp from './abstract';

export default class EOMethod extends AbstractEOProp<
  AST.EOMethod,
  AST.ClassMethod
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp;

  protected override readonly supportsObjectLiteralDecorators = true;

  /**
   * Transform object method to class method
   *
   * For example { foo() { }} --> { foo() { }}
   */
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
