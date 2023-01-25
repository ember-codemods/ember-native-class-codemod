import type { EOMethod, EOProperty } from '../../ast';
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
  readonly isComputed: boolean | undefined;
  readonly isOverridden: boolean | undefined;
  private readonly runtimeType: string | undefined;

  constructor(eoProp: P, runtimeData: RuntimeData | undefined) {
    this._prop = eoProp;

    if (runtimeData?.type) {
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

  get value(): P['value'] {
    return this._prop.value;
  }

  get key(): P['key'] {
    return this._prop.key;
  }

  get name(): string {
    return this._prop.key.name;
  }

  get type(): P['value']['type'] {
    return this._prop.value.type;
  }

  get comments(): P['comments'] {
    return this._prop.comments;
  }

  get computed(): boolean {
    return this._prop.computed ?? false;
  }

  get kind(): 'init' | 'get' | 'set' | 'method' | undefined {
    let kind: 'init' | 'get' | 'set' | 'method' = this._prop.kind;
    const method = this._prop.method ?? false;

    if (
      kind === 'init' &&
      this.hasDecorators &&
      this.decorators.some((d) => d.importedName === 'computed')
    ) {
      kind = 'get';
    }

    if (method || this.hasMethodDecorator) {
      kind = 'method';
    }

    return kind;
  }

  get hasRuntimeData(): boolean {
    return !!this.runtimeType;
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

  private get hasMethodDecorator(): boolean {
    return this.decorators.some((d) => d.isMethodDecorator);
  }

  get hasMetaDecorator(): boolean {
    return this.decorators.some((d) => d.isMetaDecorator);
  }
}
