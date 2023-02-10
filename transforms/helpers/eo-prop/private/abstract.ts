import type {
  Decorator,
  EOExpressionProp,
  EOMethod,
  EOProperty,
} from '../../ast';
import { isNode } from '../../ast';
import type { DecoratorImportInfo } from '../../decorator-info';
import type { Options } from '../../options';
import type { RuntimeData } from '../../runtime-data';
import {
  DECORATORS_REQUIRED_PROP_NAMES,
  allowObjectLiteralDecorator,
} from '../../util/index';

interface EODecoratorArgs {
  unobserves?: Array<string | boolean | number | null> | undefined;
  off?: Array<string | boolean | number | null> | undefined;
}

type EOPropValue = EOProperty['value'] | EOMethod;

/**
 * Ember Object Property
 *
 * A wrapper object for ember object properties
 */
export default abstract class AbstractEOProp<P extends EOExpressionProp, B> {
  readonly _prop: P & {
    // ast-types missing these properties that exist on @babel/types
    decorators?: Decorator[] | null;
    method?: boolean | undefined;
  };

  protected readonly decorators: DecoratorImportInfo[] = [];
  readonly decoratorArgs: EODecoratorArgs = {};

  /** Runtime Data */
  readonly runtimeData: RuntimeData;
  isComputed: boolean | undefined;
  private readonly runtimeType: string | undefined;

  constructor(eoProp: P, protected readonly options: Options) {
    this._prop = eoProp;

    this.runtimeData = options.runtimeData;
    if (this.runtimeData.type) {
      const {
        type,
        computedProperties = [],
        offProperties = {},
        unobservedProperties = {},
      } = this.runtimeData;

      const name = this.name;
      if (name in unobservedProperties) {
        this.decorators.push({ name: 'unobserves' });
        this.decoratorArgs.unobserves = unobservedProperties[name];
      }
      if (name in offProperties) {
        this.decorators.push({ name: 'off' });
        this.decoratorArgs.off = offProperties[name];
      }
      if (computedProperties.includes(name)) {
        this.isComputed = true;
      }
      this.runtimeType = type;
    }
  }

  // FIXME: Verify that everything on these classes is still needed
  // FIXME: Verify access modifiers
  abstract value: EOPropValue;

  abstract build(): B;

  get type(): EOPropValue['type'] {
    return this.value.type;
  }

  get key(): P['key'] {
    return this._prop.key;
  }

  get name(): string {
    return this._prop.key.name;
  }

  get comments(): P['comments'] {
    return this._prop.comments;
  }

  get computed(): boolean {
    return this._prop.computed ?? false;
  }

  get isOverridden(): boolean {
    return this.runtimeData.overriddenProperties?.includes(this.name) ?? false;
  }

  get hasRuntimeData(): boolean {
    return !!this.runtimeType;
  }

  get existingDecorators(): Decorator[] | null {
    return this._prop.decorators ?? null;
  }

  get decoratorNames(): string[] {
    return this.decorators.map((d) => d.name);
  }

  get hasDecorators(): boolean {
    return this.decorators.length > 0;
  }

  get hasUnobservesDecorator(): boolean {
    return this.decoratorNames.includes('unobserves');
  }

  get hasOffDecorator(): boolean {
    return this.decoratorNames.includes('off');
  }

  get hasMetaDecorator(): boolean {
    return this.decorators.some((d) => d.isMetaDecorator);
  }

  /** Override to `true` if the property type supports object literal decorators. */
  protected supportsObjectLiteralDecorators = false;

  protected get needsDecorators(): boolean {
    return this.hasExistingDecorators || this.hasDecorators;
  }

  private get hasExistingDecorators(): boolean {
    return (
      this.existingDecorators !== null && this.existingDecorators.length > 0
    );
  }

  get errors(): string[] {
    let errors: string[] = [];

    const { decorators, objectLiteralDecorators } = this.options;

    if (this.existingDecorators) {
      if (!this.supportsObjectLiteralDecorators) {
        errors.push(
          this.makeError(
            'can only transform object literal decorators on methods or properties with literal values (string, number, boolean, null, undefined)'
          )
        );
      }

      // FIXME: only include if existing decorators are supported?
      for (const decorator of this.existingDecorators) {
        const decoratorName = isNode(decorator.expression, 'Identifier')
          ? decorator.expression.name
          : isNode(decorator.expression, 'CallExpression') &&
            isNode(decorator.expression.callee, 'Identifier')
          ? decorator.expression.callee.name
          : null;

        if (!decoratorName) {
          errors.push(
            this.makeError('decorator expression type not supported')
          );
        } else if (
          // TODO: Don't check this for EOMethodProp
          !allowObjectLiteralDecorator(decoratorName, objectLiteralDecorators)
        ) {
          errors.push(
            this.makeError(
              "decorator '@${decoratorName}' not included in ALLOWED_OBJECT_LITERAL_DECORATORS or option '--objectLiteralDecorators'"
            )
          );
        }
      }
    }

    if (!decorators && this.needsDecorators) {
      errors.push(this.makeError("need option '--decorators=true'"));
    }

    const unsupportedPropNames: readonly string[] = decorators
      ? []
      : DECORATORS_REQUIRED_PROP_NAMES;
    if (unsupportedPropNames.includes(this.name)) {
      errors.push(
        this.makeError(
          `property with name '${this.name}' and type '${this.type}' can not be transformed`
        )
      );
    }

    errors = [...errors, ...this._errors];

    return errors;
  }

  /** Override to add errors specific to the property type. */
  protected get _errors(): string[] {
    return [];
  }

  protected makeError(message: string): string {
    return `[${this.name}]: Transform not supported - ${message}`;
  }
}
