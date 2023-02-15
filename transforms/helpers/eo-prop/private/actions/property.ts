import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import { createIdentifierDecorator } from '../../../decorator-helper';
import { ACTION_DECORATOR_NAME } from '../../../util/index';
import AbstractEOProp from '../abstract';
import type { Action } from './index';

/**
 * Ember Object Action Property
 *
 * A wrapper object for an Identifier property of an Ember Object `actions`
 * object property.
 *
 * It will be transformed into a `ClassMethod` with the `@action` decorator.
 *
 * @example
 *
 * ```
 * import someActionUtil from 'some/action/util';
 *
 * const MyObject = EmberObject.extend({
 *   actions: {
 *     someActionUtil
 *   }
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * import someActionUtil from 'some/action/util';
 *
 * class MyObject extends EmberObject {
 *   @action
 *   someActionUtil() {
 *     return someActionUtil.call(this, ...arguments);
 *   }
 * }
 * ```
 */
export default class EOActionProp
  extends AbstractEOProp<AST.EOActionProp, AST.ClassMethod>
  implements Action
{
  readonly isClassDecorator = false as const;

  readonly hasInfiniteLoop = false;

  protected readonly value = this.rawProp.value;

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
