import { default as j } from 'jscodeshift';
import * as AST from '../helpers/ast';
import type { DecoratorImportInfoMap } from './decorator-info';
import { getDecoratorImportInfo } from './decorator-info';
import type { Options } from './options';
import {
  createEmberDecoratorSpecifiers,
  createImportDeclaration,
} from './transform-helper';
import {
  DECORATOR_PATHS,
  DECORATOR_PATH_OVERRIDES,
  EMBER_DECORATOR_SPECIFIERS,
} from './util/index';
import { assert, defined, isString, verified } from './util/types';

/** Returns true of the specifier is a decorator */
function isSpecifierDecorator(
  specifier: Exclude<
    AST.Path<AST.ImportDeclaration>['value']['specifiers'],
    undefined
  >[number],
  importPropDecoratorMap: Record<string, string> | undefined
): specifier is AST.ImportSpecifier {
  return (
    !importPropDecoratorMap ||
    (specifier.type === 'ImportSpecifier' &&
      !!importPropDecoratorMap[specifier.imported.name])
  );
}

/** Return the local identifier of import specifier */
function getSpecifierLocalIdentifier(
  specifier: AST.ImportSpecifier
): AST.ImportSpecifier['local'] {
  if (specifier.local?.name === specifier.imported.name) {
    return null;
  }
  return specifier.local;
}

/**
 * Set decorator names and remove the duplicated `local` property on specifier
 * For example - `observer` in ember need to be transformed to `@observes` in decorators
 */
function setSpecifierNames(
  specifier: AST.ImportSpecifier,
  importPropDecoratorMap: Record<string, string> | undefined
): AST.ImportSpecifier {
  specifier.local = defined(getSpecifierLocalIdentifier(specifier));
  if (importPropDecoratorMap) {
    const decoratorImportedName = defined(
      importPropDecoratorMap[specifier.imported.name]
    );
    specifier.imported.name = decoratorImportedName;
    // Needed one more time as we changed the imported name
    specifier.local = defined(getSpecifierLocalIdentifier(specifier));
  }

  return specifier;
}

/** Get decorated props from `import` statements */
function getExistingDecoratorImports(
  root: AST.Collection
): Array<AST.Path<AST.DecoratorImportDeclaration>> {
  const imports: Array<AST.Path<AST.DecoratorImportDeclaration>> = [];

  for (const path in Object.fromEntries(DECORATOR_PATHS)) {
    const decoratorImport = getExistingImportForPath(root, path);
    if (decoratorImport) {
      imports.push(decoratorImport);
    }
  }

  return imports;
}

/**
 * Create the import declaration for the decorators which are not part of
 * existing import path.
 * For example - The decorators `@layout`, `@tagName` need to be imported from
 * `@ember-decorators/component`
 */
function createNewImportDeclarations(
  root: AST.Collection,
  decoratorsToImport: string[],
  /** Already imported paths */
  decoratorPathsToIgnore: string[],
  options: Options
): void {
  const firstDeclaration = AST.getFirstDeclaration(root);

  if (options.classicDecorator) {
    firstDeclaration.insertBefore(
      createImportDeclaration(
        [j.importDefaultSpecifier(j.identifier('classic'))],
        'ember-classic-decorator'
      )
    );
  }

  const edPathNameMap = new Map(EMBER_DECORATOR_SPECIFIERS);

  // Create new import statements which do not have any matching existing imports
  const paths = [...edPathNameMap.keys()].filter(
    (path) => !decoratorPathsToIgnore.includes(path)
  );

  for (const path of paths) {
    const specifiers = createEmberDecoratorSpecifiers(
      edPathNameMap.get(path),
      decoratorsToImport
    ).sort((a, b) => a.imported.name.localeCompare(b.imported.name));

    if (specifiers.length > 0) {
      firstDeclaration.insertBefore(createImportDeclaration(specifiers, path));
    }
  }
}

/**
 * Iterate through existing imports, extract the already imported specifiers
 *
 * It will return a map in following format:
 * ```
 * {
 *  "@ember-decorators/path1/...": [specifier1, ... ]
 * }
 * ```
 */
function getDecoratorPathSpecifiers(
  root: AST.Collection,
  decoratorsToImport: string[] = []
): Record<string, AST.ImportSpecifier[]> {
  const edPathNameMap = new Map(EMBER_DECORATOR_SPECIFIERS);

  const decoratorPathSpecifierMap: Record<string, AST.ImportSpecifier[]> = {};

  const existingDecoratorImports = getExistingDecoratorImports(root);

  // Iterate over the existing imports
  // Extract and process the specifiers
  // Construct the map with path as key and value as list of specifiers to import from the path
  for (const decoratorImport of existingDecoratorImports) {
    const { importPropDecoratorMap, decoratorPath } = defined(
      DECORATOR_PATHS.get(
        verified(decoratorImport.value.source.value, isString)
      )
    );
    // Decorators to be imported for the path
    // These are typically additional decorators which need to be imported for a path
    // For example - `@action` decorator
    const decoratorsForPath = edPathNameMap.get(decoratorPath) ?? [];
    // delete the visited path to avoid duplicate imports
    edPathNameMap.delete(decoratorPath);

    // Create decorator specifiers for which no existing specifiers present in the current path
    // e.g. `actions` need not to be imported but `@action` need to be imported from `@ember-decorators/object`
    const decoratedSpecifiers = createEmberDecoratorSpecifiers(
      decoratorsForPath,
      decoratorsToImport
    );
    const existingSpecifiers = decoratorImport.value.specifiers ?? [];

    // Iterate over existing specifiers for the current path. This is needed
    // to pick the only required specifiers from the existing imports
    // For example - To pick `observer` from `import { get, set, observer } from "@ember/object"`
    for (let i = existingSpecifiers.length - 1; i >= 0; i -= 1) {
      const existingSpecifier = defined(existingSpecifiers[i]);

      if (isSpecifierDecorator(existingSpecifier, importPropDecoratorMap)) {
        // Update decorator local and imported names,
        // Needed in case of `observer` which need to be renamed to `@observes`
        setSpecifierNames(existingSpecifier, importPropDecoratorMap);
        // Check if the decorator import path is overridden
        // Needed in case of `observes` which need to be imported from `@ember-decorators/object`
        const overriddenPath = DECORATOR_PATH_OVERRIDES.get(
          existingSpecifier.imported.name
        );
        if (overriddenPath) {
          decoratorPathSpecifierMap[overriddenPath] = [
            ...(decoratorPathSpecifierMap[overriddenPath] ?? []),
            existingSpecifier,
          ];
        } else {
          const isSpecifierPresent = decoratedSpecifiers.some((specifier) => {
            return (
              !specifier.local?.name &&
              specifier.imported.name === existingSpecifier.imported.name
            );
          });
          if (!isSpecifierPresent) {
            decoratedSpecifiers.push(existingSpecifier);
          }
        }

        // Remove the specifier from the existing import
        existingSpecifiers.splice(i, 1);
      }
    }

    if (decoratedSpecifiers.length > 0) {
      decoratorPathSpecifierMap[decoratorPath] = [
        ...(decoratorPathSpecifierMap[decoratorPath] ?? []),
        ...decoratedSpecifiers,
      ];

      if (existingSpecifiers.length <= 0) {
        j(decoratorImport).remove();
      }
    }
  }

  return decoratorPathSpecifierMap;
}

/** Get existing import statement matching the import path */
function getExistingImportForPath(
  root: AST.Collection,
  importPath: string
): AST.Path<AST.DecoratorImportDeclaration> | undefined {
  const assertion = AST.makeDecoratorImportDeclarationAssertion(importPath);
  const decoratorImports = AST.findPaths(root, j.ImportDeclaration, assertion);
  return AST.getFirstPath(decoratorImports);
}

/**
 * Create the import statements for decorators
 *
 * It does the following
 * 1. Iterate through existing imports, extract the already imported specifiers
 * 2. Update the existing import statement and add new one if needed
 * 3. Insert the new imports for which no existing imports found
 */
export function createDecoratorImportDeclarations(
  root: AST.Collection,
  decoratorsToImport: string[],
  options: Options
): void {
  // Iterate through existing imports, extract the already imported specifiers
  const decoratorPathSpecifierMap = getDecoratorPathSpecifiers(
    root,
    decoratorsToImport
  );

  const firstDeclaration = AST.getFirstDeclaration(root);
  const decoratorPathsImported = Object.keys(decoratorPathSpecifierMap);
  // Create import statement replacing the existing ones with specifiers importing from ember-decorators namespace
  for (const decoratorPath of decoratorPathsImported) {
    const specifiers = defined(decoratorPathSpecifierMap[decoratorPath]);
    const existingImport = getExistingImportForPath(root, decoratorPath);
    if (existingImport) {
      const existingSpecifiers = existingImport.value.specifiers;
      if (existingSpecifiers) {
        existingImport.value.specifiers = [
          ...existingSpecifiers,
          ...specifiers,
        ];
      }
    } else {
      firstDeclaration.insertBefore(
        createImportDeclaration(specifiers, decoratorPath)
      );
    }
  }

  // Create new import declarations
  createNewImportDeclarations(
    root,
    decoratorsToImport,
    decoratorPathsImported,
    options
  );
}

/**
 * Get decorator import info from `import` statements
 *
 * e.g. For these imports:
 * `import { observer as watcher, computed } from '@ember/object';`
 *
 * The returned value will be:
 * ```
 * {
 *   watcher: {
 *     name: "watcher",
 *     importedName: "observer",
 *     isImportedAs: true,
 *     isMetaDecorator: false,
 *     isMethodDecorator: true,
 *     localName: "watcher",
 *   },
 *   computed: {
 *     name: "computed",
 *     importedName: "computed",
 *     isImportedAs: false,
 *     isMetaDecorator: false,
 *     isMethodDecorator: false,
 *     localName: "computed",
 *   }
 * }
 * ```
 */
export function getDecoratorImportInfos(
  root: AST.Collection
): DecoratorImportInfoMap {
  const existingDecoratorImports = getExistingDecoratorImports(root);
  const decoratorImportInfo: DecoratorImportInfoMap = new Map();

  for (const decoratorImport of existingDecoratorImports) {
    const { importPropDecoratorMap } = defined(
      DECORATOR_PATHS.get(
        verified(decoratorImport.value.source.value, isString)
      )
    );

    const specifiers = decoratorImport.value.specifiers ?? [];

    for (const specifier of specifiers) {
      if (isSpecifierDecorator(specifier, importPropDecoratorMap)) {
        const localName = specifier.local?.name;
        assert(localName, 'expected localName');
        decoratorImportInfo.set(
          localName,
          getDecoratorImportInfo(specifier, importPropDecoratorMap)
        );
      }
    }
  }

  return decoratorImportInfo;
}
