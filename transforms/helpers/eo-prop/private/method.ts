import { default as j } from 'jscodeshift';
import type { ClassMethod, EOMethod } from '../../ast';
import { replaceMethodSuperExpression } from '../../transform-helper';
import AbstractEOProp from './abstract';

export default class EOMethodProp extends AbstractEOProp<
  EOMethod,
  ClassMethod
> {
  /**
   * Transform object method to class method
   *
   * For example { foo() { }} --> { foo() { }}
   */
  override build(): ClassMethod {
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

  protected override supportsObjectLiteralDecorators = true;

  get value(): EOMethod {
    return this._prop;
  }

  get kind(): 'get' | 'set' | 'method' {
    return this.value.kind;
  }

  get params(): EOMethod['params'] {
    return this.value.params;
  }

  get body(): EOMethod['body'] {
    return this.value.body;
  }
}
