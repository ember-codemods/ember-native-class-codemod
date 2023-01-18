import type { Property } from 'jscodeshift';
import type { ImportPropDecoratorMap } from '../decorator-info';
import type { RuntimeData } from '../runtime-data';
import { assert } from '../util/types';
import type { default as EOProp } from './private/abstract';
import EOActionsObjectProp, {
  isEOActionsPropProperty,
} from './private/actions-object';
import EOBaseProp, { isEOProperty } from './private/base';
import EOCallExpressionProp, {
  isCallExpressionProperty,
} from './private/call-expression';
import EOClassDecoratorProp, {
  isClassDecoratorProperty,
} from './private/class-decorator';
import EOFunctionExpressionProp, {
  isFunctionExpressionProperty,
} from './private/function-expression';

export type { default as EOProp } from './private/abstract';
export { default as EOActionsObjectProp } from './private/actions-object';
export { default as EOBaseProp } from './private/base';
export { default as EOCallExpressionProp } from './private/call-expression';
export { default as EOClassDecoratorProp } from './private/class-decorator';
export { default as EOFunctionExpressionProp } from './private/function-expression';

export interface EOProps {
  instanceProps: EOProp[];
}

/** FIXME */
export default function makeEOProp(
  eoProp: Property,
  runtimeData: RuntimeData | undefined,
  importedDecoratedProps: ImportPropDecoratorMap
): EOProp {
  if (isCallExpressionProperty(eoProp)) {
    return new EOCallExpressionProp(
      eoProp,
      runtimeData,
      importedDecoratedProps
    );
  } else if (isFunctionExpressionProperty(eoProp)) {
    return new EOFunctionExpressionProp(eoProp, runtimeData);
  } else if (isClassDecoratorProperty(eoProp)) {
    return new EOClassDecoratorProp(eoProp, runtimeData);
  } else if (isEOActionsPropProperty(eoProp)) {
    return new EOActionsObjectProp(eoProp, runtimeData);
  } else {
    assert(isEOProperty(eoProp));
    return new EOBaseProp(eoProp, runtimeData);
  }
}
