import type { CallExpression, Property } from 'jscodeshift';
import type { RuntimeData } from './runtime-data';
import {
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
  get,
  getPropName,
  isClassDecoratorProp,
} from './util';
import type { JsonValue } from './util/types';
import { assert, isString, verified } from './util/types';

export interface EOProps {
  instanceProps: EOProp[];
}

type ImportedDecoratedProps = object;

interface EODecorator {
  name: 'unobserves' | 'off' | 'className' | 'attribute' | string;
  importedName?: 'computed';
  isMethodDecorator?: boolean;
  isMetaDecorator?: boolean;
}

interface EODecoratorArgs {
  unobserves?: Array<string | boolean | number | null> | undefined;
  off?: Array<string | boolean | number | null> | undefined;
}

interface EOModifier {
  prop:
    | Extract<CallExpression['callee'], { property: any }>['property']
    | undefined;
  args: CallExpression['arguments'];
}

/**
 * Get property modifier from the property callee object
 */
function getModifier(calleeObject: CallExpression): EOModifier {
  return {
    prop:
      'property' in calleeObject.callee
        ? calleeObject.callee.property
        : undefined,
    args: calleeObject.arguments,
  };
}

// FIXME: Mark public/private props
/**
 * Ember Object Property
 *
 * A wrapper object for ember object properties
 */
export default class EOProp {
  readonly _prop: Property;

  /** Runtime Data */
  readonly decorators: EODecorator[] = [];
  readonly modifiers: EOModifier[] = [];
  readonly decoratorArgs: EODecoratorArgs = {};
  readonly emberType: string | undefined;
  readonly isComputed: boolean | undefined;
  readonly overriddenActions: JsonValue[] | undefined;
  readonly isOverridden: boolean | undefined;
  readonly runtimeType: string | undefined;

  /** CallExpression data */
  calleeObject: CallExpression | undefined;

  constructor(
    eoProp: Property,
    runtimeData: RuntimeData,
    importedDecoratedProps: ImportedDecoratedProps
  ) {
    this._prop = eoProp;

    if (runtimeData.type) {
      const {
        type,
        computedProperties = [],
        offProperties = {},
        overriddenActions = [],
        overriddenProperties = [],
        unobservedProperties = {},
      } = runtimeData;

      this.emberType = type;

      const name = this.name;
      if (Object.keys(unobservedProperties).includes(name)) {
        this.decorators.push({ name: 'unobserves' });
        this.decoratorArgs['unobserves'] = unobservedProperties[name];
      }
      if (Object.keys(offProperties).includes(name)) {
        this.decorators.push({ name: 'off' });
        this.decoratorArgs['off'] = offProperties[name];
      }
      if (computedProperties.includes(name)) {
        this.isComputed = true;
      }
      if (this.isActions) {
        this.overriddenActions = overriddenActions;
      }
      this.isOverridden = overriddenProperties.includes(name);
      this.runtimeType = type;
    }

    // FIXME: Extract `is` method?
    // FIXME: Split out this type into a separate class?
    if ('value' in this._prop && this._prop.value.type === 'CallExpression') {
      let calleeObject = this._prop.value;
      const modifiers = [getModifier(calleeObject)];
      while (calleeObject.callee.type === 'MemberExpression') {
        calleeObject = get(calleeObject, 'callee.object');
        modifiers.push(getModifier(calleeObject));
      }
      this.calleeObject = calleeObject;
      this.modifiers = modifiers.reverse();
      this.modifiers.shift();

      // @ts-expect-error
      if (importedDecoratedProps[this.calleeName]) {
        // @ts-expect-error
        this.decorators.push(importedDecoratedProps[this.calleeName]);
      } else if (this.isComputed) {
        this.decorators.push({ name: this.calleeName });
      }
    }
  }

  get value(): Property['value'] {
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

  get key(): Property['key'] {
    return this._prop.key;
  }

  get name(): string {
    return getPropName(this._prop);
  }

  get type(): Property['value']['type'] {
    return this._prop.value.type;
  }

  get calleeName(): string {
    assert(this.calleeObject !== undefined, 'Cannot find calleeObject');
    assert('name' in this.calleeObject.callee);
    return verified(this.calleeObject.callee.name, isString);
  }

  get comments(): Property['comments'] {
    return this._prop.comments;
  }

  get computed(): boolean {
    return 'computed' in this._prop && this._prop.computed;
  }

  get isClassDecorator(): boolean {
    return isClassDecoratorProp(this.name);
  }

  get decoratorNames(): string[] {
    return this.decorators.map((d) => d.name);
  }

  get classDecoratorName(): string {
    if (
      this.name === LAYOUT_DECORATOR_NAME &&
      'name' in this.value && // e.g. CallExpression doesn't have `name`
      this.value.name === LAYOUT_DECORATOR_NAME
    ) {
      return LAYOUT_DECORATOR_LOCAL_NAME;
    }
    return this.name;
  }

  get isLayoutDecorator(): boolean {
    return this.classDecoratorName === LAYOUT_DECORATOR_NAME;
  }

  get isTemplateLayoutDecorator(): boolean {
    return this.classDecoratorName === LAYOUT_DECORATOR_LOCAL_NAME;
  }

  get isCallExpression(): boolean {
    return this.type === 'CallExpression';
  }

  get hasDecorators(): boolean {
    return this.decorators.length > 0;
  }

  get callExprArgs(): CallExpression['arguments'] {
    assert(this.calleeObject !== undefined, 'Cannot find calleeObject');
    return this.calleeObject.arguments;
  }

  get shouldRemoveLastArg(): boolean {
    return this.kind === 'method' || this.kind === 'get';
  }

  get hasModifierWithArgs(): boolean {
    return this.modifiers.some((modifier) => modifier.args.length);
  }

  get hasVolatile(): boolean {
    return this.modifiers.some(
      (modifier) => get(modifier, 'prop.name') === 'volatile'
    );
  }

  get hasReadOnly(): boolean {
    return this.modifiers.some(
      (modifier) => get(modifier, 'prop.name') === 'readOnly'
    );
  }

  get isVolatileReadOnly(): boolean {
    return this.modifiers.length === 2 && this.hasVolatile && this.hasReadOnly;
  }

  get isTagName(): boolean {
    return this.name === 'tagName';
  }

  get isClassNames(): boolean {
    return this.name === 'classNames';
  }

  get isClassNameBindings(): boolean {
    return this.name === 'classNameBindings';
  }

  get isAttributeBindings(): boolean {
    return this.name === 'attributeBindings';
  }

  get isActions(): boolean {
    return this.name === 'actions';
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

  get hasMethodDecorator(): boolean {
    return this.decorators.some((d) => d.isMethodDecorator);
  }

  get hasMetaDecorator(): boolean {
    return this.decorators.some((d) => d.isMetaDecorator);
  }
}
