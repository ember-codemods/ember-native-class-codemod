import { default as j } from 'jscodeshift';
import type {
  ClassMethod,
  EOPropertyWithFunctionExpression,
  FunctionExpression,
} from '../../ast';
import { replaceSuperExpressions } from '../../transform-helper';
import AbstractEOProp from './abstract';

export default class EOFunctionExpressionProp extends AbstractEOProp<
  EOPropertyWithFunctionExpression,
  ClassMethod
> {
  /**
   * Transform functions to class methods
   *
   * For example { foo: function() { }} --> { foo() { }}
   */
  override build(): ClassMethod {
    return replaceSuperExpressions(
      j.classMethod.from({
        kind: this.kind,
        key: this.key,
        params: this.params,
        body: this.body,
        comments: this.comments,
        decorators: this.existingDecorators,
      }),
      this,
      { isAction: false }
    );
  }

  protected override supportsObjectLiteralDecorators = true;

  get value(): FunctionExpression {
    return this._prop.value;
  }

  readonly kind = 'method';

  get params(): FunctionExpression['params'] {
    return this.value.params;
  }

  get body(): FunctionExpression['body'] {
    return this.value.body;
  }
}
