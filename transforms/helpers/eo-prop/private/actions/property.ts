import { default as j } from 'jscodeshift';
import type { ClassMethod, EOActionProperty } from '../../../ast';
import AbstractEOProp from '../abstract';
import { buildActionDecorator } from '../../../decorator-helper';

export default class ActionProp extends AbstractEOProp<
  EOActionProperty,
  ClassMethod
> {
  get value(): EOActionProperty['value'] {
    return this._prop.value;
  }

  /**
   * Actions with identifier converted to method definition
   *
   * For example in case of following action
   * ```
   * import someActionUtil from 'some/action/util';
   *
   * const Foo = Component.extend({
   *   actions: {
   *     someActionUtil
   *   }
   * });
   * ```
   *
   * will be transformed to:
   *
   * ```
   * import someActionUtil from 'some/action/util';
   *
   * const Foo = Component.extend({
   *   @action
   *   someActionUtil() {
   *     return someActionUtil.call(this, ...arguments);
   *   }
   * });
   * ```
   */
  override build(): ClassMethod {
    const body = j.blockStatement([
      j.returnStatement(
        j.callExpression(j.memberExpression(this.value, j.identifier('call')), [
          j.thisExpression(),
          j.spreadElement(j.identifier('arguments')),
        ])
      ),
    ]);

    return j.classMethod.from({
      kind: 'method',
      key: this.key,
      params: [],
      body,
      comments: this.comments,
      decorators: buildActionDecorator(),
    });
  }
}
