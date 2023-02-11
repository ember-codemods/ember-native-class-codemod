import { default as j } from 'jscodeshift';
import type { ClassMethod, Collection } from '../../../ast';
import {
  findPaths,
  makeEOActionInfiniteCallAssertion,
  makeEOActionInfiniteLiteralAssertion,
} from '../../../ast';
import { buildActionDecorator } from '../../../decorator-helper';
import { replaceActionSuperExpressions } from '../../../transform-helper';
import EOMethodProp from '../method';
import type { Action } from './index';

export default class ActionMethod extends EOMethodProp implements Action {
  // FIXME: Try to reuse EOMethodProp build?
  override build(): ClassMethod {
    return replaceActionSuperExpressions(
      j.classMethod.from({
        kind: this.kind,
        key: this.key,
        params: this.params,
        body: this.body,
        comments: this.comments,
        decorators: buildActionDecorator(),
      }),
      this.replaceSuperWithUndefined
    );
  }

  override get isOverridden(): boolean {
    return this.runtimeData.overriddenActions.includes(this.name);
  }

  get hasInfiniteLoop(): boolean {
    const { name, value } = this;
    const collection = j(value.body) as Collection;

    // Occurrences of this.actionName()
    const isEOActionInfiniteCall = makeEOActionInfiniteCallAssertion(name);
    const actionCalls = findPaths(
      collection,
      j.CallExpression,
      isEOActionInfiniteCall
    );

    // Occurrences of this.get('actionName')() or get(this, 'actionName')()
    const isEOActionInfiniteLiteral =
      makeEOActionInfiniteLiteralAssertion(name);
    const actionLiterals = findPaths(
      collection,
      j.StringLiteral,
      isEOActionInfiniteLiteral
    );

    return actionLiterals.length > 0 || actionCalls.length > 0;
  }
}
