import type {
  EOPropertyWithFunctionExpression,
  FunctionExpression,
} from '../../ast';
import AbstractEOProp from './abstract';

export default class EOFunctionExpressionProp extends AbstractEOProp<EOPropertyWithFunctionExpression> {
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
