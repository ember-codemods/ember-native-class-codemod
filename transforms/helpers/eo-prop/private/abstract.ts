import type {
  Decorator,
  EOExpressionProp,
  EOMethod,
  EOProperty,
} from '../../ast';
import type { DecoratorImportInfo } from '../../decorator-info';
import type { Options } from '../../options';
import type { RuntimeData } from '../../runtime-data';

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
export default abstract class AbstractEOProp<
  P extends EOExpressionProp = EOExpressionProp
> {
  readonly _prop: P & {
    decorators?: Decorator[] | null;
    // ast-types missing `method` boolean property
    method?: boolean | undefined;
  };

  protected readonly decorators: DecoratorImportInfo[] = [];
  readonly decoratorArgs: EODecoratorArgs = {};

  /** Runtime Data */
  readonly runtimeData: RuntimeData;
  isComputed: boolean | undefined;
  isOverridden: boolean | undefined;
  private readonly runtimeType: string | undefined;

  constructor(eoProp: P, protected readonly options: Options) {
    this._prop = eoProp;

    this.runtimeData = options.runtimeData;
    if (this.runtimeData.type) {
      const {
        type,
        computedProperties = [],
        offProperties = {},
        overriddenProperties = [],
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
      this.isOverridden = overriddenProperties.includes(name);
      this.runtimeType = type;
    }
  }

  abstract value: EOPropValue;

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
}
