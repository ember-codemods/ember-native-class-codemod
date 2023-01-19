import type { CallExpression, Identifier, Property } from 'jscodeshift';
import type { DecoratorImportInfoMap } from '../../decorator-info';
import type { RuntimeData } from '../../runtime-data';
import { assert, isString, verified } from '../../util/types';
import AbstractEOProp from './abstract';

type CallExpressionProperty = Property & {
  value: CallExpression;
  key: Identifier;
};

/** Type predicate */
export function isCallExpressionProperty(
  property: Property
): property is CallExpressionProperty {
  return property.value.type === 'CallExpression';
}

interface CallExpressionModifier {
  prop:
    | Extract<CallExpression['callee'], { property: unknown }>['property']
    | undefined;
  args: CallExpression['arguments'];
}

/**
 * Get property modifier from the property callee object
 */
function getModifier(calleeObject: CallExpression): CallExpressionModifier {
  return {
    prop:
      'property' in calleeObject.callee
        ? calleeObject.callee.property
        : undefined,
    args: calleeObject.arguments,
  };
}

export default class EOCallExpressionProp extends AbstractEOProp<
  CallExpression,
  CallExpressionProperty
> {
  private calleeObject: CallExpression;
  readonly modifiers: CallExpressionModifier[];

  constructor(
    eoProp: CallExpressionProperty,
    runtimeData: RuntimeData | undefined,
    existingDecoratorImportInfos: DecoratorImportInfoMap
  ) {
    super(eoProp, runtimeData);

    let calleeObject = this._prop.value;
    const modifiers = [getModifier(calleeObject)];
    while (
      'callee' in calleeObject &&
      calleeObject.callee.type === 'MemberExpression'
    ) {
      assert(calleeObject.callee.object.type === 'CallExpression');
      calleeObject = calleeObject.callee.object;
      modifiers.push(getModifier(calleeObject));
    }
    this.calleeObject = calleeObject;
    this.modifiers = modifiers.reverse();
    this.modifiers.shift();

    const decoratorImportInfo = existingDecoratorImportInfos.get(
      this.calleeName
    );
    if (decoratorImportInfo) {
      this.decorators.push(decoratorImportInfo);
    } else if (this.isComputed) {
      this.decorators.push({ name: this.calleeName });
    }
  }

  private get calleeName(): string {
    assert('name' in this.calleeObject.callee);
    return verified(this.calleeObject.callee.name, isString);
  }

  get arguments(): CallExpression['arguments'] {
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

  get shouldRemoveLastArg(): boolean {
    return this.kind === 'method' || this.kind === 'get';
  }
}
