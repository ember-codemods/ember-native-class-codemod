import { default as j } from 'jscodeshift';
import type {
  ClassMethod,
  Collection,
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
import ActionMethod from './method';
import ActionProp from './property';
import type { DecoratorImportSpecs } from '../../../parse-helper';

export default class EOActionsProp extends AbstractEOProp<
  EOPropertyWithActionsObject,
  ClassMethod[]
> {
  /**
   * FIXME: Verify docs
   *
   * Create action decorators
   * ```
   * Converts
   * {
   *  actions: {
   *    foo() {}
   *  }
   * }
   * ```
   * to
   * ```
   * {
   *  @action
   *  foo(){ }
   * }
   * ```
   */
  override build(): ClassMethod[] {
    return this.actions.map((action) => {
      return action.build();
    });
  }

  override get decoratorImportSpecs(): DecoratorImportSpecs {
    return {
      ...super.decoratorImportSpecs,
      action: true,
    };
  }

  get value(): EOPropertyWithActionsObject['value'] {
    return this._prop.value;
  }

  private get actions(): Array<ActionProp | ActionMethod> {
    return this.value.properties.map((raw) =>
      isEOActionMethod(raw)
        ? new ActionMethod(raw, this.options)
        : new ActionProp(raw, this.options)
    );
  }

  protected override get _errors(): string[] {
    return [...this.lifecycleHookErrors, ...this.infiniteLoopErrors];
  }

  // FIXME: Try to move these onto action class(es)
  /**
   * Iterate over actions and verify that the action name does not match the lifecycle hooks
   * The transformation is not supported if an action has the same name as lifecycle hook
   * Reference: https://github.com/scalvert/ember-native-class-codemod/issues/34
   */
  private get lifecycleHookErrors(): string[] {
    const { actions } = this;
    const errors: string[] = [];
    for (const action of actions) {
      const { name } = action;
      if (LIFECYCLE_HOOKS.has(name)) {
        errors.push(
          this.makeActionError(
            name,
            'action name matches one of the lifecycle hooks. Rename and try again. See https://github.com/scalvert/ember-native-class-codemod/issues/34 for more details'
          )
        );
      }
    }
    return errors;
  }

  // FIXME: Try to move these onto action class(es)
  /**
   * Validation against pattern mentioned https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2
   */
  private get infiniteLoopErrors(): string[] {
    const { actions } = this;
    const errors: string[] = [];
    for (const action of actions) {
      const { name } = action;
      if (action instanceof ActionMethod) {
        const collection = j(action.value.body) as Collection;

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

        if (actionLiterals.length > 0 || actionCalls.length > 0) {
          errors.push(
            this.makeActionError(
              name,
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
