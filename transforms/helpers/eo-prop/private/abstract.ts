import type { Property } from 'jscodeshift';
import type { DecoratorInfo } from '../../decorator-info';
import type { RuntimeData } from '../../runtime-data';
import { getPropName } from '../../util/index';
import { assert } from '../../util/types';

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
  V extends Property['value'] = Property['value'],
  P extends Property & { value: V } = Property & { value: V }
> {
  readonly _prop: P;

  protected readonly decorators: DecoratorInfo[] = [];
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

    // FIXME: Extract `is` method?
  }

  get value(): V {
    return this._prop.value;
  }

  get kind(): 'init' | 'get' | 'set' | 'method' | undefined {
    // FIXME: Are these ever undefined?
    let kind: 'init' | 'get' | 'set' | 'method' | undefined =
      'kind' in this._prop ? this._prop.kind : undefined;
    const method = 'method' in this._prop ? this._prop.method : undefined;

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

  get key(): P['key'] {
    return this._prop.key;
  }

  get name(): string {
    return getPropName(this._prop);
  }

  get type(): V['type'] {
    return this._prop.value.type;
  }

  get comments(): P['comments'] {
    return this._prop.comments;
  }

  get properties(): Extract<V, { properties: unknown }>['properties'] {
    // FIXME: If this never gets hit we can narrow prop type
    assert(
      'properties' in this._prop.value,
      'expected prop value to have properties'
    );
    return this._prop.value.properties;
  }

  get computed(): boolean {
    return 'computed' in this._prop && this._prop.computed;
  }

  get decoratorNames(): string[] {
    return this.decorators.map((d) => d.name);
  }

  get hasDecorators(): boolean {
    return this.decorators.length > 0;
  }

  get shouldRemoveLastArg(): boolean {
    return this.kind === 'method' || this.kind === 'get';
  }

  get hasUnobservesDecorator(): boolean {
    return this.decoratorNames.includes('unobserves');
  }

  get hasOffDecorator(): boolean {
    return this.decoratorNames.includes('off');
  }

  get hasRuntimeData(): boolean {
    return !!this.runtimeType;
  }

  private get hasMethodDecorator(): boolean {
    return this.decorators.some((d) => d.isMethodDecorator);
  }

  get hasMetaDecorator(): boolean {
    return this.decorators.some((d) => d.isMetaDecorator);
  }
}
