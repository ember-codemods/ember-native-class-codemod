import * as AST from '../ast';
import type { DecoratorImportInfoMap } from '../decorator-info';
import type { Options } from '../options';
import { assert } from '../util/types';
import EOActionsProp from './private/actions';
import type EOComputedFunctionExpressionProp from './private/call-expression/function-expression';
import { makeEOCallExpressionProp } from './private/call-expression/index';
import type EOComputedObjectExpressionProp from './private/call-expression/object-expression';
import type EODecoratedProp from './private/call-expression/property';
import EOClassDecorator from './private/class-decorator';
import EOFunctionExpressionProp from './private/function-expression';
import EOMethod from './private/method';
import EOSimpleProp from './private/simple';

// Intentionally not included in EOProp union type.
export type { default as EOClassDecorator } from './private/class-decorator';

export type EOProp =
  | EOActionsProp
  | EOSimpleProp
  | EOComputedFunctionExpressionProp
  | EOComputedObjectExpressionProp
  | EODecoratedProp
  | EOFunctionExpressionProp
  | EOMethod;

/**
 * Makes an object representing an Ember Object property for the given
 * Property, RuntimeData, and ImportPropDecoratorMap.
 */
export default function makeEOProp(
  eoProp: AST.EOExpressionProp,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  options: Options
): EOProp | EOClassDecorator {
  if (AST.isEOCallExpressionProp(eoProp)) {
    return makeEOCallExpressionProp(
      eoProp,
      existingDecoratorImportInfos,
      options
    );
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
