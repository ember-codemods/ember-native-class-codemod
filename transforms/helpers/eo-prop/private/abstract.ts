import * as AST from '../../ast';
import type { DecoratorImportInfo } from '../../decorator-info';
import type { Options } from '../../options';
import type { RuntimeData } from '../../runtime-data';
import type { DecoratorImportSpecs } from '../../util/index';
import {
  OBSERVES_DECORATOR_NAME,
  OFF_DECORATOR_NAME,
  UNOBSERVES_DECORATOR_NAME,
  allowObjectLiteralDecorator,
} from '../../util/index';

type EOPropValue = AST.EOProp['value'] | AST.EOMethod;

/**
 * Ember Object Property
 *
 * A wrapper object for Ember Object properties and methods.
 *
 * Each subclass is required to implement a `build` method that returns the
 * appropriate AST node (or array thereof) to be added to the parent
 * `EOExtendExpression`'s `ClassBody`.
 */
export default abstract class AbstractEOProp<
  P extends AST.EOExpressionProp,
  B
> {
  abstract readonly isClassDecorator: boolean;

  protected abstract readonly value: EOPropValue;

  protected readonly key = this.rawProp.key;

  protected readonly comments = this.rawProp.comments ?? null;

  protected readonly existingDecorators = this.rawProp.decorators ?? null;

  protected decorators: DecoratorImportInfo[] = [];

  protected readonly runtimeData: RuntimeData | null;

  /**
   * Override to `true` if the property type supports object literal decorators
   * or to `'withVerification'` if the property type supports object literal
   * decorators as long as they are on the allow-list.
   */
  protected readonly objectLiteralDecoratorSupport:
    | boolean
    | 'withVerification' = false;

  constructor(
    protected readonly rawProp: P & {
      // ast-types missing these properties that exist on @babel/types
      decorators?: AST.Decorator[] | null;
    },
    protected readonly options: Options
  ) {
    this.runtimeData = options.runtimeData;
    if (this.runtimeData) {
      const { offProperties, unobservedProperties } = this.runtimeData;

      const unobservedArgs = unobservedProperties[this.name];
      if (unobservedArgs) {
        this.decorators.push({
          name: UNOBSERVES_DECORATOR_NAME,
          args: unobservedArgs,
        });
      }

      const offArgs = offProperties[this.name];
      if (offArgs) {
        this.decorators.push({ name: OFF_DECORATOR_NAME, args: offArgs });
      }
    }
  }

  get name(): string {
    return this.key.name;
  }

  /**
   * Get the map of decorators to import other than the computed props, services etc
   * which already have imports in the code
   */
  get decoratorImportSpecs(): DecoratorImportSpecs {
    return {
      action: false,
      classNames: false,
      classNameBindings: false,
      attributeBindings: false,
      layout: false,
      templateLayout: false,
      off: this.hasOffDecorator,
      tagName: false,
      observes: this.hasObservesDecorator,
      unobserves: this.hasUnobservesDecorator,
    };
  }

  get errors(): string[] {
    let errors: string[] = [];

    const { decorators } = this.options;

    if (this.existingDecorators) {
      if (!this.objectLiteralDecoratorSupport) {
        errors.push(
          this.makeError(
            'can only transform object literal decorators on methods or properties with literal values (string, number, boolean, null, undefined)'
          )
        );
      }

      for (const decorator of this.existingDecorators) {
        const decoratorName = AST.isNode(decorator.expression, 'Identifier')
          ? decorator.expression.name
          : AST.isNode(decorator.expression, 'CallExpression') &&
            AST.isNode(decorator.expression.callee, 'Identifier')
          ? decorator.expression.callee.name
          : null;

        if (!decoratorName) {
          errors.push(
            this.makeError('decorator expression type not supported')
          );
        } else if (
          this.objectLiteralDecoratorSupport === 'withVerification' &&
          !allowObjectLiteralDecorator(
            decoratorName,
            decorators ? decorators.inObjectLiterals : []
          )
        ) {
          errors.push(
            this.makeError(
              `decorator '@${decoratorName}' not included in ALLOWED_OBJECT_LITERAL_DECORATORS or option '--objectLiteralDecorators'`
            )
          );
        }
      }
    }

    if (!decorators && this.needsDecorators) {
      errors.push(this.makeError("need option '--decorators=true'"));
    }

    errors = [...errors, ...this.typeErrors];

    return errors;
  }

  /** Returns the appropriate ClassBody member for the property type. */
  abstract build(): B;

  protected makeError(message: string): string {
    return `[${this.name}]: Transform not supported - ${message}`;
  }

  /** Override to add errors specific to the property type. */
  protected get typeErrors(): string[] {
    return [];
  }

  protected get type(): EOPropValue['type'] {
    return this.value.type;
  }

  protected get isOverridden(): boolean {
    return this.runtimeData?.overriddenProperties.includes(this.name) ?? false;
  }

  protected get replaceSuperWithUndefined(): boolean {
    return this.hasRuntimeData && !this.isOverridden;
  }

  private get hasRuntimeData(): boolean {
    return this.runtimeData !== null;
  }

  protected get hasDecorators(): boolean {
    return this.decorators.length > 0;
  }

  protected get needsDecorators(): boolean {
    return this.hasExistingDecorators || this.hasDecorators;
  }

  private get hasObservesDecorator(): boolean {
    return this.decorators.some((d) => d.name === OBSERVES_DECORATOR_NAME);
  }

  private get hasUnobservesDecorator(): boolean {
    return this.decorators.some((d) => d.name === UNOBSERVES_DECORATOR_NAME);
  }

  private get hasOffDecorator(): boolean {
    return this.decorators.some((d) => d.name === OFF_DECORATOR_NAME);
  }

  private get hasExistingDecorators(): boolean {
    return (
      this.existingDecorators !== null && this.existingDecorators.length > 0
    );
  }
}
