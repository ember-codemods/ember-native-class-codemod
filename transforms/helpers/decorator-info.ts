import { assert } from './util/types';
import { COMPUTED_DECORATOR_NAME, METHOD_DECORATORS } from './util/index';
import type * as AST from '../helpers/ast';

export interface DecoratorImportInfo {
  name: string;
  importedName?: string;
  isImportedAs?: boolean;
  isComputedDecorator?: boolean;
  isMetaDecorator?: boolean;
  isMethodDecorator?: boolean;
  localName?: string;
  args?: Array<string | boolean | number | null>;
}

export type DecoratorImportInfoMap = Map<
  /** local name */ string,
  DecoratorImportInfo
>;

/**
 * Return the decorator name for the specifier if any, using the importPropDecoratorMap from
 * `DECORATOR_PATHS` config (defined util.js)
 */
export function getDecoratorImportInfo(
  specifier: AST.ImportSpecifier,
  importPropDecoratorMap: Record<string, string> | undefined
): DecoratorImportInfo {
  const localName = specifier.local?.name;
  const importedName = specifier.imported.name;
  const isImportedAs = importedName !== localName;
  const isMetaDecorator = !importPropDecoratorMap;
  let name: string;
  if (isImportedAs || isMetaDecorator) {
    assert(localName, 'expected local name');
    name = localName;
  } else {
    const newName = importPropDecoratorMap[importedName];
    assert(newName, 'expected importPropDecoratorMap[importedName]');
    name = newName;
  }

  const isMethodDecorator = METHOD_DECORATORS.has(importedName);
  const isComputedDecorator = COMPUTED_DECORATOR_NAME === importedName;
  return {
    name,
    importedName,
    isImportedAs,
    isComputedDecorator,
    isMetaDecorator,
    isMethodDecorator,
    localName,
  };
}
