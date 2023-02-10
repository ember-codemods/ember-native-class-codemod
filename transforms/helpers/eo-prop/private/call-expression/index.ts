import type { EOPropertyWithCallExpression } from '../../../ast';
import {
  isEOCallExpressionInnerCallee,
  isEOMemberExpressionForModifier,
} from '../../../ast';
import type {
  DecoratorImportInfo,
  DecoratorImportInfoMap,
} from '../../../decorator-info';
import type { Options } from '../../../options';
import { assert, defined } from '../../../util/types';
import EOComputedFunctionExpressionProp from './function-expression';
import { getModifier } from './modifier-helper';
import EOComputedObjectExpressionProp from './object-expression';
import EODecoratedProp from './property';

/**
 * FIXME
 */
export function makeEOCallExpressionProp(
  raw: EOPropertyWithCallExpression,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  options: Options
):
  | EOComputedFunctionExpressionProp
  | EOComputedObjectExpressionProp
  | EODecoratedProp {
  let calleeObject = raw.value;
  const modifiers = [getModifier(calleeObject)];
  while (isEOMemberExpressionForModifier(calleeObject.callee)) {
    calleeObject = calleeObject.callee.object;
    modifiers.push(getModifier(calleeObject));
  }
  modifiers.reverse();
  modifiers.shift();

  assert(
    isEOCallExpressionInnerCallee(calleeObject),
    'calleeObject should be isEOCallExpressionInnerCallee'
  );

  const calleeName = calleeObject.callee.name;

  const decorators = getDecorators(
    raw,
    existingDecoratorImportInfos,
    calleeName,
    options
  );

  const kind = getKind(raw, decorators);

  const args = calleeObject.arguments;
  if ((kind === 'method' || kind === 'get') && args.length > 0) {
    const lastArg = defined(args[args.length - 1]);
    if (lastArg.type === 'FunctionExpression') {
      return new EOComputedFunctionExpressionProp(
        raw,
        calleeObject,
        modifiers,
        kind,
        decorators,
        options
      );
    } else if (lastArg.type === 'ObjectExpression') {
      return new EOComputedObjectExpressionProp(
        raw,
        calleeObject,
        modifiers,
        kind,
        decorators,
        options
      );
    } else {
      throw new Error(
        'Expected last argument in call expression to be a FunctionExpression or ObjectExpression'
      );
    }
  }

  return new EODecoratedProp(
    raw,
    calleeObject,
    modifiers,
    kind,
    decorators,
    options
  );
}

function getDecorators(
  raw: EOPropertyWithCallExpression,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  calleeName: string,
  options: Options
): DecoratorImportInfo[] {
  const decorators: DecoratorImportInfo[] = [];
  const decoratorImportInfo = existingDecoratorImportInfos.get(calleeName);
  if (decoratorImportInfo) {
    decorators.push(decoratorImportInfo);
  } else if (options.runtimeData.computedProperties.includes(raw.key.name)) {
    decorators.push({ name: calleeName });
  }
  return decorators;
}

function getKind(
  raw: EOPropertyWithCallExpression,
  decorators: DecoratorImportInfo[]
): 'get' | 'method' | undefined {
  let kind: 'get' | 'method' | undefined;
  const method = !!('method' in raw && raw.method);

  if (decorators.some((d) => d.importedName === 'computed')) {
    kind = 'get';
  }

  if (method || decorators.some((d) => d.isMethodDecorator)) {
    kind = 'method';
  }
  return kind;
}
