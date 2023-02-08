import type { EOExpressionProp } from '../ast';
import {
  isEOMethod,
  isEOPropertyForActionsObject,
  isEOPropertyForClassDecorator,
  isEOPropertySimple,
  isEOPropertyWithCallExpression,
  isEOPropertyWithFunctionExpression,
} from '../ast';
import type { DecoratorImportInfoMap } from '../decorator-info';
import type { RuntimeData } from '../runtime-data';
import { assert } from '../util/types';
import EOActionsProp from './private/actions';
import EOCallExpressionProp from './private/call-expression';
import EOClassDecoratorProp from './private/class-decorator';
import EOFunctionExpressionProp from './private/function-expression';
import EOMethodProp from './private/method';
import EOSimpleProp from './private/simple';

export { default as EOActionsProp } from './private/actions';
export { default as EOCallExpressionProp } from './private/call-expression';
export { default as EOClassDecoratorProp } from './private/class-decorator';
export { default as EOFunctionExpressionProp } from './private/function-expression';
export { default as EOMethodProp } from './private/method';
export { default as EOSimpleProp } from './private/simple';

export type EOProp =
  | EOActionsProp
  | EOSimpleProp
  | EOCallExpressionProp
  | EOClassDecoratorProp
  | EOFunctionExpressionProp
  | EOMethodProp;

export interface EOProps {
  instanceProps: EOProp[];
}

/**
 * Makes an object representing an Ember Object property for the given
 * Property, RuntimeData, and ImportPropDecoratorMap.
 */
export default function makeEOProp(
  eoProp: EOExpressionProp,
  runtimeData: RuntimeData,
  existingDecoratorImportInfos: DecoratorImportInfoMap
): EOProp {
  if (isEOPropertyWithCallExpression(eoProp)) {
    return new EOCallExpressionProp(
      eoProp,
      runtimeData,
      existingDecoratorImportInfos
    );
  } else if (isEOMethod(eoProp)) {
    return new EOMethodProp(eoProp, runtimeData);
  } else if (isEOPropertyWithFunctionExpression(eoProp)) {
    return new EOFunctionExpressionProp(eoProp, runtimeData);
  } else if (isEOPropertyForClassDecorator(eoProp)) {
    return new EOClassDecoratorProp(eoProp, runtimeData);
  } else if (isEOPropertyForActionsObject(eoProp)) {
    return new EOActionsProp(eoProp, runtimeData);
  } else {
    assert(isEOPropertySimple(eoProp));
    return new EOSimpleProp(eoProp, runtimeData);
  }
}
