import type {
  ASTPath,
  Collection,
  ImportDeclaration,
  ImportSpecifier,
  JSCodeshift,
} from 'jscodeshift';
import { DEFAULT_OPTIONS } from './options';
import {
  createEmberDecoratorSpecifiers,
  createImportDeclaration,
} from './transform-helper';
import {
  DECORATOR_PATHS,
  DECORATOR_PATH_OVERRIDES,
  EMBER_DECORATOR_SPECIFIERS,
  METHOD_DECORATORS,
  getFirstDeclaration,
} from './util';
import { assert, defined, isString, verified } from './util/types';

interface DecoratorInfo {
  name: string;
  importedName: string;
  isImportedAs: boolean;
  isMetaDecorator: boolean;
  isMethodDecorator: boolean;
  localName: string;
}

type ImportPropDecoratorMap = Record<string, DecoratorInfo>;

/**
 * Return the decorator name for the specifier if any, using the importPropDecoratorMap from
 * `DECORATOR_PATHS` config (defined util.js)
 */
function getDecoratorInfo(
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

  const isMethodDecorator = METHOD_DECORATORS.includes(
    importedName as (typeof METHOD_DECORATORS)[number]
  );
  return {
    name,
    importedName,
    isImportedAs,
    isMetaDecorator,
    isMethodDecorator,
    localName,
  };
}

/** Returns true of the specifier is a decorator */
function isSpecifierDecorator(
  specifier: Exclude<
    ASTPath<ImportDeclaration>['value']['specifiers'],
    undefined
  >[number],
  importPropDecoratorMap: Record<string, string> | undefined
): specifier is ImportSpecifier {
  return (
    !importPropDecoratorMap ||
    (specifier.type === 'ImportSpecifier' &&
      !!importPropDecoratorMap[specifier.imported.name])
  );
}

/** Return the local identifier of import specifier */
function getSpecifierLocalIdentifier(
  specifier: ImportSpecifier
): ImportSpecifier['local'] {
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
  specifier: ImportSpecifier,
  importPropDecoratorMap: Record<string, string> | undefined
): ImportSpecifier {
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
  j: JSCodeshift,
  root: Collection<unknown>
): ASTPath<ImportDeclaration>[] {
  const imports: ASTPath<ImportDeclaration>[] = [];

  for (const path in DECORATOR_PATHS) {
    const decoratorImports = root.find(j.ImportDeclaration, {
      source: {
        value: path,
      },
    });

    if (decoratorImports.length > 0) {
      imports.push(decoratorImports.get());
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
  j: JSCodeshift,
  root: Collection<unknown>,
  decoratorsToImport: string[],
  /** Already imported paths */
  decoratorPathsToIgnore: string[] = [],
  options = DEFAULT_OPTIONS
): void {
  const firstDeclaration = getFirstDeclaration(j, root);

  if (options.classicDecorator) {
    firstDeclaration.insertBefore(
      createImportDeclaration(
        j,
        [j.importDefaultSpecifier(j.identifier('classic'))],
        'ember-classic-decorator'
      )
    );
  }

  // Create new import statements which do not have any matching existing imports
  Object.keys(EMBER_DECORATOR_SPECIFIERS)
    .filter((path) => !decoratorPathsToIgnore.includes(path))
    .forEach((path) => {
      const specifiers = createEmberDecoratorSpecifiers(
        j,
        EMBER_DECORATOR_SPECIFIERS[path],
        decoratorsToImport
      );

      if (specifiers.length > 0) {
        firstDeclaration.insertBefore(
          createImportDeclaration(j, specifiers, path)
        );
      }
    });
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
  j: JSCodeshift,
  root: Collection<unknown>,
  decoratorsToImport: string[] = []
): Record<string, ImportSpecifier[]> {
  // create a copy - we need to mutate the object later
  const edPathNameMap = Object.assign({}, EMBER_DECORATOR_SPECIFIERS);

  const decoratorPathSpecifierMap: Record<string, ImportSpecifier[]> = {};

  const existingDecoratorImports = getExistingDecoratorImports(j, root);

  // Iterate over the existing imports
  // Extract and process the specifiers
  // Construct the map with path as key and value as list of specifiers to import from the path
  for (const decoratorImport of existingDecoratorImports) {
    const { importPropDecoratorMap, decoratorPath } = defined(
      DECORATOR_PATHS[verified(decoratorImport.value.source.value, isString)]
    );
    // Decorators to be imported for the path
    // These are typically additional decorators which need to be imported for a path
    // For example - `@action` decorator
    const decoratorsForPath = edPathNameMap[decoratorPath] || [];
    // delete the visited path to avoid duplicate imports
    // FIXME: Switch to actual Map
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete edPathNameMap[decoratorPath];

    // Create decorator specifiers for which no existing specifiers present in the current path
    // e.g. `actions` need not to be imported but `@action` need to be imported from `@ember-decorators/object`
    const decoratedSpecifiers = createEmberDecoratorSpecifiers(
      j,
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
        const overriddenPath =
          DECORATOR_PATH_OVERRIDES[existingSpecifier.imported.name];
        if (overriddenPath) {
          decoratorPathSpecifierMap[overriddenPath] = [
            ...(decoratorPathSpecifierMap[overriddenPath] || []),
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
        ...(decoratorPathSpecifierMap[decoratorPath] || []),
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
  j: JSCodeshift,
  root: Collection<unknown>,
  importPath: string
): ASTPath<ImportDeclaration> | undefined {
  const decoratorImports = root.find(j.ImportDeclaration, {
    source: {
      value: importPath,
    },
  });

  if (decoratorImports.length > 0) {
    return decoratorImports.get();
  }
  return;
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
  j: JSCodeshift,
  root: Collection<unknown>,
  decoratorsToImport: string[] = [],
  options = DEFAULT_OPTIONS
): void {
  // Iterate through existing imports, extract the already imported specifiers
  const decoratorPathSpecifierMap = getDecoratorPathSpecifiers(
    j,
    root,
    decoratorsToImport
  );

  const firstDeclaration = getFirstDeclaration(j, root);
  const decoratorPathsImported = Object.keys(decoratorPathSpecifierMap);
  // Create import statement replacing the existing ones with specifiers importing from ember-decorators namespace
  for (const decoratorPath of decoratorPathsImported) {
    const specifiers = defined(decoratorPathSpecifierMap[decoratorPath]);
    const existingImport = getExistingImportForPath(j, root, decoratorPath);
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
        createImportDeclaration(j, specifiers, decoratorPath)
      );
    }
  }

  // Create new import declarations
  createNewImportDeclarations(
    j,
    root,
    decoratorsToImport,
    decoratorPathsImported,
    options
  );
}

/** Get decorated props from `import` statements */
export function getImportedDecoratedProps(
  j: JSCodeshift,
  root: Collection<unknown>
): ImportPropDecoratorMap {
  const existingDecoratorImports = getExistingDecoratorImports(j, root);
  const importedDecorators: ImportPropDecoratorMap = {};

  for (const decoratorImport of existingDecoratorImports) {
    const { importPropDecoratorMap } = defined(
      DECORATOR_PATHS[
        decoratorImport.value.source.value as keyof typeof DECORATOR_PATHS
      ]
    );

    const specifiers = decoratorImport.value.specifiers ?? [];

    for (const specifier of specifiers) {
      if (isSpecifierDecorator(specifier, importPropDecoratorMap)) {
        const localName = specifier.local?.name;
        assert(localName, 'expected localName'); // FIXME: Do we hit this?
        importedDecorators[localName] = getDecoratorInfo(
          specifier,
          importPropDecoratorMap
        );
      }
    }
  }

  return importedDecorators;
}
