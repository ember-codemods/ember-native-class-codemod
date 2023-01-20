import type { EOProperty } from '../ast';
import {
  isEOPropertyForActionsObject,
  isEOPropertyForClassDecorator,
  isEOPropertySimple,
  isEOPropertyWithCallExpression,
  isEOPropertyWithFunctionExpression,
} from '../ast';
import type { DecoratorImportInfoMap } from '../decorator-info';
import type { RuntimeData } from '../runtime-data';
import { assert } from '../util/types';
import EOActionsObjectProp from './private/actions-object';
import EOCallExpressionProp from './private/call-expression';
import EOClassDecoratorProp from './private/class-decorator';
import EOFunctionExpressionProp from './private/function-expression';
import EOSimpleProp from './private/simple';

export { default as EOActionsObjectProp } from './private/actions-object';
export { default as EOCallExpressionProp } from './private/call-expression';
export { default as EOClassDecoratorProp } from './private/class-decorator';
export { default as EOFunctionExpressionProp } from './private/function-expression';
export { default as EOSimpleProp } from './private/simple';

export type EOProp =
  | EOActionsObjectProp
  | EOSimpleProp
  | EOCallExpressionProp
  | EOClassDecoratorProp
  | EOFunctionExpressionProp;

export interface EOProps {
  instanceProps: EOProp[];
}

/**
 * Makes an object representing an Ember Object property for the given
 * Property, RuntimeData, and ImportPropDecoratorMap.
 */
export default function makeEOProp(
  eoProp: EOProperty,
  runtimeData: RuntimeData | undefined,
  existingDecoratorImportInfos: DecoratorImportInfoMap
): EOProp {
  if (isEOPropertyWithCallExpression(eoProp)) {
    return new EOCallExpressionProp(
      eoProp,
      runtimeData,
      existingDecoratorImportInfos
    );
  } else if (isEOPropertyWithFunctionExpression(eoProp)) {
    return new EOFunctionExpressionProp(eoProp, runtimeData);
  } else if (isEOPropertyForClassDecorator(eoProp)) {
    return new EOClassDecoratorProp(eoProp, runtimeData);
  } else if (isEOPropertyForActionsObject(eoProp)) {
    return new EOActionsObjectProp(eoProp, runtimeData);
  } else {
    assert(isEOPropertySimple(eoProp));
    return new EOSimpleProp(eoProp, runtimeData);
  }
}
