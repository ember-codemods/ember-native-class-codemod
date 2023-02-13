import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import { createIdentifierDecorator } from '../../../decorator-helper';
import { ACTION_DECORATOR_NAME } from '../../../util/index';
import AbstractEOProp from '../abstract';
import type { Action } from './index';

export default class EOActionProp
  extends AbstractEOProp<AST.EOActionProp, AST.ClassMethod>
  implements Action
{
  readonly isClassDecorator = false as const;

  readonly hasInfiniteLoop = false;

  protected readonly value = this.rawProp.value;

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
  build(): AST.ClassMethod {
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
      decorators: [createIdentifierDecorator(ACTION_DECORATOR_NAME)],
    });
  }
}
