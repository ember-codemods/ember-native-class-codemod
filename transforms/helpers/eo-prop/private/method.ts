import { default as j } from 'jscodeshift';
import type { ClassMethod, EOMethod } from '../../ast';
import { replaceMethodSuperExpression } from '../../transform-helper';
import AbstractEOProp from './abstract';

export default class EOMethodProp extends AbstractEOProp<
  EOMethod,
  ClassMethod
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp;

  protected override readonly supportsObjectLiteralDecorators = true;

  /**
   * Transform object method to class method
   *
   * For example { foo() { }} --> { foo() { }}
   */
  build(): ClassMethod {
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

  protected get params(): EOMethod['params'] {
    return this.value.params;
  }

  protected get body(): EOMethod['body'] {
    return this.value.body;
  }
}
