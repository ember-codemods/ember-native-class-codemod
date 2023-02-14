import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import type { DecoratorImportInfo } from '../../../decorator-info';
import logger from '../../../log-helper';
import type { Options } from '../../../options';
import { defined } from '../../../util/types';
import AbstractEOProp from '../abstract';
import type { CallExpressionModifier } from './modifier-helper';
import { COMPUTED_DECORATOR_NAME } from '../../../util/index';

/**
 * Ember Object Call Expression Property
 *
 * A wrapper object for Ember Object properties with `CallExpression` values
 * to be transformed the appropriate AST node (or array thereof) to be added to
 * the parent `EOExtendExpression`'s `ClassBody`.
 *
 * See each subclass for more details.
 */
export default abstract class AbstractEOCallExpressionProp<
  B extends AST.ClassProperty | AST.ClassMethod | AST.ClassMethod[]
> extends AbstractEOProp<AST.EOCallExpressionProp, B> {
  readonly isClassDecorator = false as const;

  protected readonly value = this.rawProp.value;

  constructor(
    eoProp: AST.EOCallExpressionProp,
    private calleeObject: AST.EOCallExpressionInnerCallee,
    readonly modifiers: CallExpressionModifier[],
    readonly kind: 'get' | 'method' | undefined,
    decoratorsToAdd: DecoratorImportInfo[],
    options: Options
  ) {
    super(eoProp, options);
    this.decorators = [...this.decorators, ...decoratorsToAdd];
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  protected override get needsDecorators(): boolean {
    return true;
  }

  protected get arguments(): AST.EOCallExpressionInnerCallee['arguments'] {
    return this.calleeObject.arguments;
  }

  protected override get typeErrors(): string[] {
    const errors: string[] = [];

    if (!this.hasDecorators) {
      errors.push(
        this.makeError(`call to '${this.calleeName}' can not be transformed`)
      );
    }

    if (this.hasModifierWithArgs) {
      errors.push(
        this.makeError("value has modifiers like 'property' or 'meta'")
      );
    }

    if (this.hasVolatile && this.hasMetaDecorator) {
      errors.push(
        this.makeError(
          "value has 'volatile' modifier with computed meta ('@ember/object/computed') is not supported"
        )
      );
    }

    return errors;
  }

  protected buildDecorators(): AST.Decorator[] {
    const decorators: AST.Decorator[] = [];
    for (const decorator of this.decorators) {
      const decoratorName = decorator.name;
      if (this.isVolatileReadOnly) {
        logger.info(`[${this.name}] Ignored decorator ${decoratorName}`);
      } else {
        decorators.push(this.buildDecorator(decoratorName));
      }
    }

    return [...(this.existingDecorators ?? []), ...decorators];
  }

  private get calleeName(): string {
    return this.calleeObject.callee.name;
  }

  private get shouldBuildMethods(): boolean {
    return this.kind === 'method' || this.kind === 'get';
  }

  private get hasModifierWithArgs(): boolean {
    return this.modifiers.some((modifier) => modifier.args.length);
  }

  private get hasVolatile(): boolean {
    return this.modifiers.some(
      (modifier) =>
        modifier.prop &&
        'name' in modifier.prop &&
        modifier.prop.name === 'volatile'
    );
  }

  private get hasReadOnly(): boolean {
    return this.modifiers.some(
      (modifier) =>
        modifier.prop &&
        'name' in modifier.prop &&
        modifier.prop.name === 'readOnly'
    );
  }

  private get isVolatileReadOnly(): boolean {
    return this.modifiers.length === 2 && this.hasVolatile && this.hasReadOnly;
  }

  /**
   * Create decorator for computed properties and methods
   * This method handles decorators for `DECORATOR_PROPS` defined in `util.js`
   */
  private buildDecorator(decoratorName: string): AST.Decorator {
    const decoratorArgs = this.shouldBuildMethods
      ? this.arguments.slice(0, -1)
      : // eslint-disable-next-line unicorn/prefer-spread
        this.arguments.slice(0);

    let decoratorExpression =
      [COMPUTED_DECORATOR_NAME, 'service', 'controller'].includes(
        decoratorName
      ) && decoratorArgs.length === 0
        ? j.identifier(decoratorName)
        : j.callExpression(j.identifier(decoratorName), decoratorArgs);

    for (const modifier of this.modifiers) {
      decoratorExpression = j.callExpression(
        j.memberExpression(decoratorExpression, defined(modifier.prop)),
        modifier.args
      );
    }

    if (this.modifiers.length === 0) {
      return j.decorator(decoratorExpression);
    }

    // If has modifiers wrap decorators in anonymous call expression
    // it transforms @computed('').readOnly() => @(computed('').readOnly())
    return j.decorator(
      j.callExpression(j.identifier(''), [decoratorExpression])
    );
  }

  private get hasMetaDecorator(): boolean {
    return this.decorators.some((d) => d.isMetaDecorator);
  }
}
