import type { CallExpression } from 'jscodeshift';
import type { RuntimeData } from './runtime-data';
import {
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
  get,
  getPropName,
  getPropType,
  isClassDecoratorProp,
} from './util';
import type { EOExpressionProp } from './util/ast';
import { JsonValue, assert } from './util/types';

export interface EOProps {
  instanceProps: EOProp[];
}

type ImportedDecoratedProps = object;

interface EODecorator {
  name: 'unobserves' | 'off';
  importedName?: 'computed';
  isMethodDecorator?: boolean;
  isMetaDecorator?: boolean;
}

interface EODecoratorArgs {
  unobserves?: JsonValue | undefined;
  off?: JsonValue | undefined;
}

interface EOModifier {
  prop: Extract<CallExpression['callee'], { property: any }>['property'] | undefined;
  args: CallExpression['arguments'];
}

/**
 * Get property modifier from the property callee object
 */
function getModifier(calleeObject: CallExpression): EOModifier {
  return {
    prop: 'property' in calleeObject.callee ? calleeObject.callee.property : undefined,
    args: calleeObject.arguments,
  };
}

/**
 * Ember Object Property
 *
 * A wrapper object for ember object properties
 */
export default class EOProp {
  readonly _prop: EOExpressionProp;

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
    eoProp: EOExpressionProp, // FIXME: Change to Property
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

  get value(): EOExpressionProp['value'] {
    return this._prop.value;
  }

  get kind(): 'init' | 'get' | 'set' | 'method' | undefined {
    // FIXME: Are these ever undefined?
    let kind: 'init' | 'get' | 'set' | 'method' | undefined =
      'kind' in this._prop ? this._prop.kind : undefined;
    let method = 'method' in this._prop ? this._prop.method : undefined;

    if (
      kind === 'init' &&
      this.hasDecorators &&
      this.decorators.find((d) => d.importedName === 'computed')
    ) {
      kind = 'get';
    }

    if (method || this.hasMethodDecorator) {
      kind = 'method';
    }

    return kind;
  }

  get key() {
    return this._prop.key;
  }

  get name() {
    return getPropName(this._prop);
  }

  get type() {
    return getPropType(this._prop);
  }

  get calleeName() {
    assert(this.calleeObject !== undefined, 'Cannot find calleeObject');
    return get(this.calleeObject, 'callee.name');
  }

  get comments() {
    return this._prop.comments;
  }

  get computed() {
    return 'computed' in this._prop && this._prop.computed;
  }

  get isClassDecorator() {
    return isClassDecoratorProp(this.name);
  }

  get decoratorNames() {
    return this.decorators.map((d) => d.name);
  }

  get classDecoratorName() {
    if (
      this.name === LAYOUT_DECORATOR_NAME &&
      'name' in this.value && // e.g. CallExpression doesn't have `name`
      this.value.name === LAYOUT_DECORATOR_NAME
    ) {
      return LAYOUT_DECORATOR_LOCAL_NAME;
    }
    return this.name;
  }

  get isLayoutDecorator() {
    return this.classDecoratorName === LAYOUT_DECORATOR_NAME;
  }

  get isTemplateLayoutDecorator() {
    return this.classDecoratorName === LAYOUT_DECORATOR_LOCAL_NAME;
  }

  get isCallExpression() {
    return this.type === 'CallExpression';
  }

  get hasDecorators() {
    return this.decorators.length;
  }

  get callExprArgs() {
    assert(this.calleeObject !== undefined, 'Cannot find calleeObject');
    return this.calleeObject.arguments;
  }

  get shouldRemoveLastArg() {
    return this.kind === 'method' || this.kind === 'get';
  }

  get hasModifierWithArgs() {
    return this.modifiers.some((modifier) => modifier.args.length);
  }

  get hasVolatile() {
    return this.modifiers.some((modifier) => get(modifier, 'prop.name') === 'volatile');
  }

  get hasReadOnly() {
    return this.modifiers.some((modifier) => get(modifier, 'prop.name') === 'readOnly');
  }

  get isVolatileReadOnly() {
    return this.modifiers.length === 2 && this.hasVolatile && this.hasReadOnly;
  }

  get isTagName() {
    return this.name === 'tagName';
  }

  get isClassNames() {
    return this.name === 'classNames';
  }

  get isClassNameBindings() {
    return this.name === 'classNameBindings';
  }

  get isAttributeBindings() {
    return this.name === 'attributeBindings';
  }

  get isActions() {
    return this.name === 'actions';
  }

  get hasUnobservesDecorator() {
    return this.decoratorNames.includes('unobserves');
  }

  get hasOffDecorator() {
    return this.decoratorNames.includes('off');
  }

  get hasRuntimeData() {
    return !!this.runtimeType;
  }

  get hasMethodDecorator() {
    return this.decorators.find((d) => d.isMethodDecorator);
  }

  get hasMetaDecorator() {
    return this.decorators.find((d) => d.isMetaDecorator);
  }
}
