import { default as j } from 'jscodeshift';
import type {
  ClassMethod,
  ClassProperty,
  Decorator,
  EOCallExpressionInnerCallee,
  EOPropertyWithCallExpression,
} from '../../../ast';
import type { DecoratorImportInfo } from '../../../decorator-info';
import logger from '../../../log-helper';
import type { Options } from '../../../options';
import { defined } from '../../../util/types';
import AbstractEOProp from '../abstract';
import type { CallExpressionModifier } from './modifier-helper';

export default abstract class AbstractEOCallExpressionProp<
  B extends ClassProperty | ClassMethod | ClassMethod[]
> extends AbstractEOProp<EOPropertyWithCallExpression, B> {
  protected buildDecorators(): Decorator[] {
    const decorators: Decorator[] = [];
    for (const decoratorName of this.decoratorNames) {
      if (this.isVolatileReadOnly) {
        logger.info(`[${this.name}] Ignored decorator ${decoratorName}`);
      } else {
        decorators.push(this.buildDecorator(decoratorName));
      }
    }

    return [...(this.existingDecorators ?? []), ...decorators];
  }

  /**
   * Create decorator for computed properties and methods
   * This method handles decorators for `DECORATOR_PROPS` defined in `util.js`
   */
  private buildDecorator(decoratorName: string): Decorator {
    const decoratorArgs = this.shouldBuildMethods
      ? this.arguments.slice(0, -1)
      : // eslint-disable-next-line unicorn/prefer-spread
        this.arguments.slice(0);

    let decoratorExpression =
      ['computed', 'service', 'controller'].includes(decoratorName) &&
      decoratorArgs.length === 0
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

  constructor(
    eoProp: EOPropertyWithCallExpression,
    private calleeObject: EOCallExpressionInnerCallee,
    readonly modifiers: CallExpressionModifier[],
    readonly kind: 'get' | 'method' | undefined,
    decoratorsToAdd: DecoratorImportInfo[],
    options: Options
  ) {
    super(eoProp, options);
    this.decorators = [...this.decorators, ...decoratorsToAdd];
  }

  get value(): EOPropertyWithCallExpression['value'] {
    return this._prop.value;
  }

  get calleeName(): string {
    return this.calleeObject.callee.name;
  }

  get arguments(): EOCallExpressionInnerCallee['arguments'] {
    return this.calleeObject.arguments;
  }

  get hasModifierWithArgs(): boolean {
    return this.modifiers.some((modifier) => modifier.args.length);
  }

  get hasVolatile(): boolean {
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

  get isVolatileReadOnly(): boolean {
    return this.modifiers.length === 2 && this.hasVolatile && this.hasReadOnly;
  }

  get shouldBuildMethods(): boolean {
    return this.kind === 'method' || this.kind === 'get';
  }

  protected override get _errors(): string[] {
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

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  protected override get needsDecorators(): boolean {
    return true;
  }
}
