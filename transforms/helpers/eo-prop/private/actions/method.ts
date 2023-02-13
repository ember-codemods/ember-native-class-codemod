import { default as j } from 'jscodeshift';
import * as AST from '../../../ast';
import { createIdentifierDecorator } from '../../../decorator-helper';
import { replaceActionSuperExpressions } from '../../../transform-helper';
import { ACTION_DECORATOR_NAME } from '../../../util/index';
import EOMethod from '../method';
import type { Action } from './index';

export default class EOActionMethod extends EOMethod implements Action {
  get hasInfiniteLoop(): boolean {
    const { name, value } = this;
    const collection = j(value.body) as AST.Collection;

    // Occurrences of this.actionName()
    const isEOActionInfiniteCall = AST.makeEOActionInfiniteCallAssertion(name);
    const actionCalls = AST.findPaths(
      collection,
      j.CallExpression,
      isEOActionInfiniteCall
    );

    // Occurrences of this.get('actionName')() or get(this, 'actionName')()
    const isEOActionInfiniteLiteral =
      AST.makeEOActionInfiniteLiteralAssertion(name);
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
    return this.runtimeData.overriddenActions.includes(this.name);
  }
}
