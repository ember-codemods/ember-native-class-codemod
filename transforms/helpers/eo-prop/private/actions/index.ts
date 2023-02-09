import { default as j } from 'jscodeshift';
import type {
  ClassMethod,
  Collection,
  EOAction,
  EOPropertyWithActionsObject,
} from '../../../ast';
import {
  findPaths,
  isEOActionMethod,
  makeEOActionInfiniteCallAssertion,
  makeEOActionInfiniteLiteralAssertion,
} from '../../../ast';
import { LIFECYCLE_HOOKS } from '../../../util/index';
import AbstractEOProp from '../abstract';

export default class EOActionsProp extends AbstractEOProp<
  EOPropertyWithActionsObject,
  ClassMethod[]
> {
  override build(): ClassMethod[] {
    throw new Error('Method not implemented.');
  }

  get value(): EOPropertyWithActionsObject['value'] {
    return this._prop.value;
  }

  get properties(): EOAction[] {
    return this.value.properties;
  }

  protected override get _errors(): string[] {
    return [...this.lifecycleHookErrors, ...this.infiniteLoopErrors];
  }

  /**
   * Iterate over actions and verify that the action name does not match the lifecycle hooks
   * The transformation is not supported if an action has the same name as lifecycle hook
   * Reference: https://github.com/scalvert/ember-native-class-codemod/issues/34
   */
  private get lifecycleHookErrors(): string[] {
    const actionProps = this.properties;
    const errors: string[] = [];
    for (const actionProp of actionProps) {
      const actionName = actionProp.key.name;
      if (LIFECYCLE_HOOKS.has(actionName)) {
        errors.push(
          this.makeActionError(
            actionName,
            'action name matches one of the lifecycle hooks. Rename and try again. See https://github.com/scalvert/ember-native-class-codemod/issues/34 for more details'
          )
        );
      }
    }
    return errors;
  }

  /**
   * Validation against pattern mentioned https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2
   */
  private get infiniteLoopErrors(): string[] {
    const actionProps = this.properties;
    const errors: string[] = [];
    for (const actionProp of actionProps) {
      const actionName = actionProp.key.name;
      if (isEOActionMethod(actionProp)) {
        const collection = j(actionProp.body) as Collection;

        // Occurrences of this.actionName()
        const isEOActionInfiniteCall =
          makeEOActionInfiniteCallAssertion(actionName);
        const actionCalls = findPaths(
          collection,
          j.CallExpression,
          isEOActionInfiniteCall
        );

        // Occurrences of this.get('actionName')() or get(this, 'actionName')()
        const isEOActionInfiniteLiteral =
          makeEOActionInfiniteLiteralAssertion(actionName);
        const actionLiterals = findPaths(
          collection,
          j.StringLiteral,
          isEOActionInfiniteLiteral
        );

        if (actionLiterals.length > 0 || actionCalls.length > 0) {
          errors.push(
            this.makeActionError(
              actionName,
              `calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details`
            )
          );
        }
      }

      return errors;
    }
    return errors;
  }

  private makeActionError(actionName: string, message: string): string {
    return this.makeError(`[${actionName}]: ${message}`);
  }
}
