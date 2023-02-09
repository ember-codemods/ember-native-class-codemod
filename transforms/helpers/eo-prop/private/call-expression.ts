import type {
  EOCallExpression,
  EOCallExpressionInnerCallee,
  EOPropertyWithCallExpression,
} from '../../ast';
import {
  isEOCallExpressionInnerCallee,
  isEOMemberExpressionForModifier,
} from '../../ast';
import type { DecoratorImportInfoMap } from '../../decorator-info';
import type { Options } from '../../options';
import { verified } from '../../util/types';
import AbstractEOProp from './abstract';

interface CallExpressionModifier {
  prop:
    | Extract<EOCallExpression['callee'], { property: unknown }>['property']
    | undefined;
  args: EOCallExpression['arguments'];
}

/**
 * Get property modifier from the property callee object
 */
function getModifier(calleeObject: EOCallExpression): CallExpressionModifier {
  return {
    prop:
      'property' in calleeObject.callee
        ? calleeObject.callee.property
        : undefined,
    args: calleeObject.arguments,
  };
}

export default class EOCallExpressionProp extends AbstractEOProp<EOPropertyWithCallExpression> {
  private calleeObject: EOCallExpressionInnerCallee;
  readonly modifiers: CallExpressionModifier[];

  constructor(
    eoProp: EOPropertyWithCallExpression,
    existingDecoratorImportInfos: DecoratorImportInfoMap,
    options: Options
  ) {
    super(eoProp, options);

    let calleeObject = this._prop.value;
    const modifiers = [getModifier(calleeObject)];
    while (isEOMemberExpressionForModifier(calleeObject.callee)) {
      calleeObject = calleeObject.callee.object;
      modifiers.push(getModifier(calleeObject));
    }
    this.calleeObject = verified(calleeObject, isEOCallExpressionInnerCallee);
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

  get value(): EOPropertyWithCallExpression['value'] {
    return this._prop.value;
  }

  get kind(): 'get' | 'method' | undefined {
    let kind: 'get' | 'method' | undefined;
    const method = this._prop.method ?? false;

    if (this.decorators.some((d) => d.importedName === 'computed')) {
      kind = 'get';
    }

    if (method || this.hasMethodDecorator) {
      kind = 'method';
    }

    return kind;
  }

  get calleeName(): string {
    return this.calleeObject.callee.name;
  }

  get arguments(): EOCallExpressionInnerCallee['arguments'] {
    return this.calleeObject.arguments;
  }

  private get hasMethodDecorator(): boolean {
    return this.decorators.some((d) => d.isMethodDecorator);
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
