import type { EOPropertySimple } from '../../ast';
import AbstractEOProp from './abstract';

export default class EOSimpleProp extends AbstractEOProp<EOPropertySimple> {
  protected override supportsObjectLiteralDecorators = true;

  get value(): EOPropertySimple['value'] {
    return this._prop.value;
  }

  protected override get _errors(): string[] {
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
}
