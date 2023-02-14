import * as AST from '../../../ast';
import type { DecoratorImportSpecs } from '../../../util/index';
import { LIFECYCLE_HOOKS } from '../../../util/index';
import AbstractEOProp from '../abstract';
import EOActionMethod from './method';
import EOActionProp from './property';

export interface Action {
  hasInfiniteLoop: boolean;
}

export default class EOActionsProp extends AbstractEOProp<
  AST.EOActionsProp,
  AST.ClassMethod[]
> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp.value;

  override get decoratorImportSpecs(): DecoratorImportSpecs {
    return {
      ...super.decoratorImportSpecs,
      action: true,
    };
  }

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
  build(): AST.ClassMethod[] {
    return this.actions.map((action) => {
      return action.build();
    });
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  protected override get needsDecorators(): boolean {
    return true;
  }

  protected override get typeErrors(): string[] {
    return [...this.lifecycleHookErrors, ...this.infiniteLoopErrors];
  }

  private get actions(): Array<EOActionProp | EOActionMethod> {
    return this.value.properties.map((raw) =>
      AST.isEOActionMethod(raw)
        ? new EOActionMethod(raw, this.options)
        : new EOActionProp(raw, this.options)
    );
  }

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

  /**
   * Validation against pattern mentioned https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2
   */
  private get infiniteLoopErrors(): string[] {
    const { actions } = this;
    const errors: string[] = [];
    for (const action of actions) {
      if (action.hasInfiniteLoop) {
        const { name } = action;
        errors.push(
          this.makeActionError(
            name,
            `calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details`
          )
        );
      }

      return errors;
    }
    return errors;
  }

  private makeActionError(actionName: string, message: string): string {
    return this.makeError(`[${actionName}]: ${message}`);
  }
}
