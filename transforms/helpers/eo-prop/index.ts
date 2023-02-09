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
import type { Options } from '../options';
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

/**
 * Makes an object representing an Ember Object property for the given
 * Property, RuntimeData, and ImportPropDecoratorMap.
 */
export default function makeEOProp(
  eoProp: EOExpressionProp,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  options: Options
): EOProp {
  if (isEOPropertyWithCallExpression(eoProp)) {
    return new EOCallExpressionProp(
      eoProp,
      existingDecoratorImportInfos,
      options
    );
  } else if (isEOMethod(eoProp)) {
    return new EOMethodProp(eoProp, options);
  } else if (isEOPropertyWithFunctionExpression(eoProp)) {
    return new EOFunctionExpressionProp(eoProp, options);
  } else if (isEOPropertyForClassDecorator(eoProp)) {
    return new EOClassDecoratorProp(eoProp, options);
  } else if (isEOPropertyForActionsObject(eoProp)) {
    return new EOActionsProp(eoProp, options);
  } else {
    assert(isEOPropertySimple(eoProp));
    return new EOSimpleProp(eoProp, options);
  }
}
