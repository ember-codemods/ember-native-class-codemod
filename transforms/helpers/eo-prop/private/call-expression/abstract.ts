import { default as j } from 'jscodeshift';
import type {
  ClassMethod,
  ClassProperty,
  Decorator,
  EOCallExpressionInnerCallee,
  EOPropertyWithCallExpression,
} from '../../../ast';
import { createInstancePropDecorators } from '../../../decorator-helper';
import type { DecoratorImportInfo } from '../../../decorator-info';
import type { Options } from '../../../options';
import type { EOCallExpressionProp } from '../../index';
import AbstractEOProp from '../abstract';
import type { CallExpressionModifier } from './modifier-helper';

export default abstract class AbstractEOCallExpressionProp<
  B extends ClassProperty | ClassMethod | ClassMethod[]
> extends AbstractEOProp<EOPropertyWithCallExpression, B> {
  // FIXME: Remove
  // @ts-expect-error FIXME
  override isEOCallExpressionProp = true;

  protected buildDecorators(): Decorator[] {
    // FIXME: Should we always pass through existing decorators?
    return [
      ...(this.existingDecorators ?? []),
      // FIXME: Weird
      ...createInstancePropDecorators(j, this as EOCallExpressionProp),
    ];
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
