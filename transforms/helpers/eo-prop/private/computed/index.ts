import * as AST from '../../../ast';
import type {
  DecoratorImportInfo,
  DecoratorImportInfoMap,
} from '../../../decorator-info';
import type { Options } from '../../../options';
import { assert } from '../../../util/types';
import EOComputedFunctionExpressionGetter from './function-expression-getter';
import EOComputedFunctionExpressionMethod from './function-expression-method';
import { getModifier } from './modifier-helper';
import EOComputedObjectExpressionProp from './object-expression';
import EOComputedProp from './property';

/**
 * Makes an object representing an Ember Object computed property.
 */
export function makeEOComputedProp(
  raw: AST.EOComputedProp,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  options: Options
):
  | EOComputedFunctionExpressionGetter
  | EOComputedFunctionExpressionMethod
  | EOComputedObjectExpressionProp
  | EOComputedProp {
  let calleeObject = raw.value;
  const modifiers = [getModifier(calleeObject)];
  while (AST.isEOMemberExpressionForModifier(calleeObject.callee)) {
    calleeObject = calleeObject.callee.object;
    modifiers.push(getModifier(calleeObject));
  }
  modifiers.reverse();
  modifiers.shift();

  assert(
    AST.isEOCallExpressionInnerCallee(calleeObject),
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
  const lastArg = args[args.length - 1];
  if (kind === 'method' && lastArg?.type === 'FunctionExpression') {
    return new EOComputedFunctionExpressionMethod(
      raw,
      calleeObject,
      modifiers,
      kind,
      decorators,
      options
    );
  } else if (kind === 'get' && lastArg?.type === 'FunctionExpression') {
    return new EOComputedFunctionExpressionGetter(
      raw,
      calleeObject,
      modifiers,
      kind,
      decorators,
      options
    );
  } else if (kind === 'get' && lastArg?.type === 'ObjectExpression') {
    return new EOComputedObjectExpressionProp(
      raw,
      calleeObject,
      modifiers,
      kind,
      decorators,
      options
    );
  }

  return new EOComputedProp(
    raw,
    calleeObject,
    modifiers,
    kind,
    decorators,
    options
  );
}

function getDecorators(
  raw: AST.EOComputedProp,
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
  raw: AST.EOComputedProp,
  decorators: DecoratorImportInfo[]
): 'get' | 'method' | undefined {
  let kind: 'get' | 'method' | undefined;
  const method = !!('method' in raw && raw.method);

  if (decorators.some((d) => d.isComputedDecorator)) {
    kind = 'get';
  }

  if (method || decorators.some((d) => d.isMethodDecorator)) {
    kind = 'method';
  }

  return kind;
}
