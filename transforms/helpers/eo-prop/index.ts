import type { Property } from 'jscodeshift';
import type { ImportPropDecoratorMap } from '../decorator-info';
import type { RuntimeData } from '../runtime-data';
import EOCallExpressionProp, {
  isCallExpressionProperty,
} from './private/call-expression';
import EOProp from './private/base';

export { default as EOProp } from './private/base';
export { default as EOCallExpressionProp } from './private/call-expression';

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
  } else {
    return new EOProp(eoProp, runtimeData);
  }
}
