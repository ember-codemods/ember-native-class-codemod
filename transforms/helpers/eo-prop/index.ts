import * as AST from '../ast';
import type { DecoratorImportInfoMap } from '../decorator-info';
import type { Options } from '../options';
import { assert } from '../util/types';
import EOActionsProp from './private/actions';
import EOClassDecorator from './private/class-decorator';
import type EOComputedFunctionExpressionGetter from './private/computed/function-expression-getter';
import type EOComputedFunctionExpressionMethod from './private/computed/function-expression-method';
import { makeEOComputedProp } from './private/computed/index';
import type EOComputedObjectExpressionProp from './private/computed/object-expression';
import type EOComputedProp from './private/computed/property';
import EOFunctionExpressionProp from './private/function-expression';
import EOMethod from './private/method';
import EOSimpleProp from './private/simple';

// Intentionally not included in EOProp union type.
export type { default as EOClassDecorator } from './private/class-decorator';

export type EOProp =
  | EOActionsProp
  | EOSimpleProp
  | EOComputedFunctionExpressionGetter
  | EOComputedFunctionExpressionMethod
  | EOComputedObjectExpressionProp
  | EOComputedProp
  | EOFunctionExpressionProp
  | EOMethod;

/**
 * Makes an object representing an Ember Object property.
 */
export default function makeEOProp(
  eoProp: AST.EOExpressionProp,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  options: Options
): EOProp | EOClassDecorator {
  if (AST.isEOCallExpressionProp(eoProp)) {
    return makeEOComputedProp(eoProp, existingDecoratorImportInfos, options);
  } else if (AST.isEOMethod(eoProp)) {
    return new EOMethod(eoProp, options);
  } else if (AST.isEOFunctionExpressionProp(eoProp)) {
    return new EOFunctionExpressionProp(eoProp, options);
  } else if (AST.isEOClassDecoratorProp(eoProp)) {
    return new EOClassDecorator(eoProp, options);
  } else if (AST.isEOActionsProp(eoProp)) {
    return new EOActionsProp(eoProp, options);
  } else {
    assert(AST.isEOSimpleProp(eoProp));
    return new EOSimpleProp(eoProp, options);
  }
}

/** Type predicate */
export function isEOProp(p: EOProp | EOClassDecorator): p is EOProp {
  return !p.isClassDecorator;
}

/** Type predicate */
export function isEOClassDecorator(
  p: EOProp | EOClassDecorator
): p is EOClassDecorator {
  return p.isClassDecorator;
}
