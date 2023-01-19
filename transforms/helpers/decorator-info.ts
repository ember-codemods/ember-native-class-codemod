import type { ImportSpecifier } from 'jscodeshift';
import { assert } from './util/types';
import { METHOD_DECORATORS } from './util/index';

export interface DecoratorInfo {
  name: 'unobserves' | 'off' | 'className' | 'attribute' | string;
  importedName?: 'computed' | string;
  isImportedAs?: boolean;
  isMetaDecorator?: boolean;
  isMethodDecorator?: boolean;
  localName?: string;
}

export type ImportPropDecoratorMap = Record<string, DecoratorInfo>;

/**
 * Return the decorator name for the specifier if any, using the importPropDecoratorMap from
 * `DECORATOR_PATHS` config (defined util.js)
 */
export function getDecoratorInfo(
  specifier: ImportSpecifier,
  importPropDecoratorMap: Record<string, string> | undefined
): DecoratorInfo {
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
  return {
    name,
    importedName,
    isImportedAs,
    isMetaDecorator,
    isMethodDecorator,
    localName,
  };
}
