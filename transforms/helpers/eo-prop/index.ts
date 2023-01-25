import type { EOMethod, EOProperty } from '../ast';
import {
  isEOMethod,
  isEOPropertyForActionsObject,
  isEOPropertyForClassDecorator,
  isEOPropertySimple,
  isEOPropertyWithCallExpression,
} from '../ast';
import type { DecoratorImportInfoMap } from '../decorator-info';
import type { RuntimeData } from '../runtime-data';
import { assert } from '../util/types';
import EOActionsProp from './private/actions';
import EOCallExpressionProp from './private/call-expression';
import EOClassDecoratorProp from './private/class-decorator';
import EOMethodProp from './private/method';
import EOSimpleProp from './private/simple';

export { default as EOActionsProp } from './private/actions';
export { default as EOCallExpressionProp } from './private/call-expression';
export { default as EOClassDecoratorProp } from './private/class-decorator';
export { default as EOMethodProp } from './private/method';
export { default as EOSimpleProp } from './private/simple';

export type EOProp =
  | EOActionsProp
  | EOSimpleProp
  | EOCallExpressionProp
  | EOClassDecoratorProp
  | EOMethodProp;

export interface EOProps {
  instanceProps: EOProp[];
}

/**
 * Makes an object representing an Ember Object property for the given
 * Property, RuntimeData, and ImportPropDecoratorMap.
 */
export default function makeEOProp(
  eoProp: EOProperty | EOMethod,
  runtimeData: RuntimeData | undefined,
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
  } else if (isEOPropertyForClassDecorator(eoProp)) {
    return new EOClassDecoratorProp(eoProp, runtimeData);
  } else if (isEOPropertyForActionsObject(eoProp)) {
    return new EOActionsProp(eoProp, runtimeData);
  } else {
    assert(isEOPropertySimple(eoProp));
    return new EOSimpleProp(eoProp, runtimeData);
  }
}
