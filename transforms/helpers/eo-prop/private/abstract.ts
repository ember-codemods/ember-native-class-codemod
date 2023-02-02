import type { Decorator, EOMethod, EOProperty } from '../../ast';
import type { DecoratorImportInfo } from '../../decorator-info';
import type { RuntimeData } from '../../runtime-data';

interface EODecoratorArgs {
  unobserves?: Array<string | boolean | number | null> | undefined;
  off?: Array<string | boolean | number | null> | undefined;
}

/**
 * Ember Object Property
 *
 * A wrapper object for ember object properties
 */
export default abstract class AbstractEOProp<
  P extends EOProperty | EOMethod = EOProperty | EOMethod
> {
  readonly _prop: P;

  protected readonly decorators: DecoratorImportInfo[] = [];
  readonly decoratorArgs: EODecoratorArgs = {};

  /** Runtime Data */
  readonly runtimeData: RuntimeData;
  isComputed: boolean | undefined;
  isOverridden: boolean | undefined;
  private readonly runtimeType: string | undefined;

  constructor(eoProp: P, runtimeData: RuntimeData) {
    this._prop = eoProp;

    this.runtimeData = runtimeData;
    if (runtimeData.type) {
      const {
        type,
        computedProperties = [],
        offProperties = {},
        overriddenProperties = [],
        unobservedProperties = {},
      } = runtimeData;

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

  abstract value: EOProperty['value'] | EOMethod;

  get type(): EOProperty['value']['type'] | EOMethod['type'] {
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

  // FIXME: Rename
  get existingDecorators(): Decorator[] | null {
    return 'decorators' in this._prop ? this._prop.decorators : null;
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
