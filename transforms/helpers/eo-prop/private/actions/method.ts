import { default as j } from 'jscodeshift';
import * as AST from '../../../ast';
import { createIdentifierDecorator } from '../../../decorator-helper';
import { replaceActionSuperExpressions } from '../../../transform-helper';
import { ACTION_DECORATOR_NAME } from '../../../util/index';
import EOMethod from '../method';
import type { Action } from './index';

/**
 * Ember Object Action Method
 *
 * A wrapper object for a method property of an Ember Object `actions` object
 * property.
 *
 * It will be transformed into a `ClassMethod` with the `@action` decorator.
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   actions: {
 *     bar() {},
 *     baz() {
 *       this._super(...arguments);
 *     }
 *   }
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * class MyObject extends EmberObject {
 *   @action
 *   bar() {}
 *
 *   @action
 *   baz() {
 *     // TODO: This call to super is within an action, and has to refer to the parent
 *     // class's actions to be safe. This should be refactored to call a normal method
 *     // on the parent class. If the parent class has not been converted to native
 *     // classes, it may need to be refactored as well. See
 *     // https://github.com/scalvert/ember-native-class-codemod/blob/master/README.md
 *     // for more details.
 *     super.actions.baz.call(this, ...arguments);
 *   }
 * }
 * ```
 */
export default class EOActionMethod extends EOMethod implements Action {
  get hasInfiniteLoop(): boolean {
    const { name, value } = this;
    const collection = j(value.body) as AST.Collection;

    // Occurrences of this.actionName()
    const isEOActionInfiniteCall = AST.makeEOActionInfiniteCallPredicate(name);
    const actionCalls = AST.findPaths(
      collection,
      j.CallExpression,
      isEOActionInfiniteCall
    );

    // Occurrences of this.get('actionName')() or get(this, 'actionName')()
    const isEOActionInfiniteLiteral =
      AST.makeEOActionInfiniteLiteralPredicate(name);
    const actionLiterals = AST.findPaths(
      collection,
      j.StringLiteral,
      isEOActionInfiniteLiteral
    );

    return actionLiterals.length > 0 || actionCalls.length > 0;
  }

  override build(): AST.ClassMethod {
    return replaceActionSuperExpressions(
      j.classMethod.from({
        kind: this.kind,
        key: this.key,
        params: this.params,
        body: this.body,
        comments: this.comments,
        decorators: [createIdentifierDecorator(ACTION_DECORATOR_NAME)],
      }),
      this.replaceSuperWithUndefined
    );
  }

  protected override get isOverridden(): boolean {
    return this.runtimeData?.overriddenActions.includes(this.name) ?? false;
  }
}
