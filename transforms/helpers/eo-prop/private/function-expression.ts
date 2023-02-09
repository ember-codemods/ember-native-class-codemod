import type {
  ClassMethod,
  EOPropertyWithFunctionExpression,
  FunctionExpression,
} from '../../ast';
import AbstractEOProp from './abstract';

export default class EOFunctionExpressionProp extends AbstractEOProp<
  EOPropertyWithFunctionExpression,
  ClassMethod
> {
  override build(): ClassMethod {
    throw new Error('Method not implemented.');
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
