const {
  DECORATOR_PATHS,
  EMBER_DECORATOR_SPECIFIERS,
  get,
  getFirstDeclaration,
  METHOD_DECORATORS
} = require("./util");
const {
  createEmberDecoratorSpecifiers,
  createImportDeclaration
} = require("./transform-helper");

/**
 * Return the decorator name for the specifier if any, using the importPropDecoratorMap from
 * `DECORATOR_PATHS` config (defined util.js)
 *
 * @param {ImportSpecifier} specifier
 * @param {Object} importPropDecoratorMap
 * @returns {String}
 */
function getDecoratorInfo(specifier, importPropDecoratorMap) {
  const localName = get(specifier, "local.name");
  const importedName = get(specifier, "imported.name");
  const isImportedAs = importedName !== localName;
  const isMetaDecorator = !importPropDecoratorMap;
  let decoratorName;
  if (isImportedAs) {
    decoratorName = localName;
  } else {
    if (isMetaDecorator) {
      decoratorName = localName;
    } else {
      decoratorName = importPropDecoratorMap[importedName];
    }
  }

  const isMethodDecorator = METHOD_DECORATORS.includes(importedName);
  return {
    decoratorName,
    importedName,
    isImportedAs,
    isMetaDecorator,
    isMethodDecorator,
    localName
  };
}

/**
 * Returns true of the specifier is a decorator
 *
 * @param {ImportSpecifier} specifier
 * @param {Object} importPropDecoratorMap
 * @returns {Boolean}
 */
function isSpecifierDecorator(specifier, importPropDecoratorMap) {
  const importedName = get(specifier, "imported.name");
  if (!importPropDecoratorMap || importPropDecoratorMap[importedName]) {
    return true;
  }
  return false;
}

/**
 * Return the local identifier of import specifier
 * @param {ImportSpecifier} specifier
 * @returns {String} local name
 */
function getSpecifierLocalIdentifier(specifier) {
  if (get(specifier, "local.name") === get(specifier, "imported.name")) {
    return null;
  }
  return specifier.local;
}

/**
 * Set decorator names and remove the duplicated `local` property on specifier
 * For example - `observer` in ember need to be transformed to `@observes` in decorators
 *
 * @param {ImportSpecifier} specifier
 * @param {Object} importPropDecoratorMap
 * @returns {ImportSpecifier}
 */
function setSpecifierNames(specifier, importPropDecoratorMap) {
  specifier.local = getSpecifierLocalIdentifier(specifier);
  if (importPropDecoratorMap) {
    const decoratorImportedName = get(
      importPropDecoratorMap,
      get(specifier, "imported.name")
    );
    specifier.imported.name = decoratorImportedName;
    // Needed one more time as we changed the imported name
    specifier.local = getSpecifierLocalIdentifier(specifier);
  }

  return specifier;
}

/**
 * Get decorated props from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {ImportDeclaration[]}
 */
function getExistingDecoratorImports(j, root) {
  return Object.keys(DECORATOR_PATHS).reduce((imports, path) => {
    const decoratorImports = root.find(j.ImportDeclaration, {
      source: {
        value: path
      }
    });

    if (decoratorImports.length) {
      imports.push(decoratorImports.get());
    }

    return imports;
  }, []);
}

/**
 * Create the import declaration for the decorators which are not part of existing import path
 * For example - The decorators `@layout`, `@tagName` need to be imported from `@ember-decorators/component`s
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @param {String[]} decoratorsToImport
 * @param {String[]} decoratorPathsToIgnore already imported paths
 */
function createNewImportDeclarations(
  j,
  root,
  decoratorsToImport,
  decoratorPathsToIgnore = []
) {
  const firstDeclaration = getFirstDeclaration(j, root);
  // Create new import statements which do not have any matching existing imports
  Object.keys(EMBER_DECORATOR_SPECIFIERS)
    .filter(path => !decoratorPathsToIgnore.includes(path))
    .forEach(path => {
      const specifiers = createEmberDecoratorSpecifiers(
        j,
        EMBER_DECORATOR_SPECIFIERS[path],
        decoratorsToImport
      );

      if (specifiers.length) {
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
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @param {String[]} decoratorsToImport
 * @returns {Object}
 */
function getDecoratorPathSpecifiers(j, root, decoratorsToImport = []) {
  // create a copy - we need to mutate the object later
  const edPathNameMap = Object.assign({}, EMBER_DECORATOR_SPECIFIERS);
  return getExistingDecoratorImports(j, root).reduce(
    (decoratorPathSpecifierMap, existingDecoratorImport) => {
      const { importPropDecoratorMap, decoratorPath } = DECORATOR_PATHS[
        get(existingDecoratorImport, "value.source.value")
      ];
      const decoratorsForPath = edPathNameMap[decoratorPath] || [];
      // delete the visited path to avoid duplicate imports
      delete edPathNameMap[decoratorPath];

      // Create decorator specifiers for which no existing specifiers present in the current path
      // e.g. `actions` need not to be imported but `@action` need to be imported from `@ember-decorators/object`
      const decoratedSpecifiers = createEmberDecoratorSpecifiers(
        j,
        decoratorsForPath,
        decoratorsToImport
      );

      const existingSpecifiers =
        get(existingDecoratorImport, "value.specifiers") || [];

      // Iterate over existing specifiers for the current path. This is needed
      // to pick the only required specifiers from the existing imports
      // For example - To pick `observer` from `import { get, set, observer } from "@ember/object"`
      for (let i = existingSpecifiers.length - 1; i >= 0; i -= 1) {
        const existingSpecifier = existingSpecifiers[i];

        if (isSpecifierDecorator(existingSpecifier, importPropDecoratorMap)) {
          // Update decorator local and imported names,
          // Needed in case of `observer` which need to be renamed to `@observes`
          setSpecifierNames(existingSpecifier, importPropDecoratorMap);
          const isSpecifierPresent = decoratedSpecifiers.some(specifier => {
            return (
              !get(specifier, "local.name") &&
              get(specifier, "imported.name") ===
                get(existingSpecifier, "imported.name")
            );
          });
          if (!isSpecifierPresent) {
            decoratedSpecifiers.push(existingSpecifier);
          }

          // Remove the specifier from the existing import
          existingSpecifiers.splice(i, 1);
        }
      }

      if (decoratedSpecifiers.length) {
        decoratorPathSpecifierMap[decoratorPath] = [].concat(
          decoratorPathSpecifierMap[decoratorPath] || [],
          decoratedSpecifiers
        );

        if (existingSpecifiers.length <= 0) {
          j(existingDecoratorImport).remove();
        }
      }

      return decoratorPathSpecifierMap;
    },
    {}
  );
}

/**
 * Create the import statements for decorators
 *
 * It does the following
 * 1. Iterate through existing imports, extract the already imported specifiers
 * 2. Update the existing import statement and add new one if needed
 * 3. Insert the new imports for which no existing imports found
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @param {String[]} decoratorsToImport
 */
function createDecoratorImportDeclarations(j, root, decoratorsToImport = []) {
  // create a copy - we need to mutate the object later
  const edPathNameMap = Object.assign({}, EMBER_DECORATOR_SPECIFIERS);

  // Iterate through existing imports, extract the already imported specifiers
  const decoratorPathSpecifierMap = getDecoratorPathSpecifiers(
    j,
    root,
    decoratorsToImport
  );
  const firstDeclaration = getFirstDeclaration(j, root);
  const decoratorPathsImported = Object.keys(decoratorPathSpecifierMap);
  // Create import statement replacing the existing ones with specifiers importing from ember-decorators namespace
  decoratorPathsImported.forEach(decoratorPath => {
    delete edPathNameMap[decoratorPath];
    const specifiers = decoratorPathSpecifierMap[decoratorPath];
    firstDeclaration.insertBefore(
      createImportDeclaration(j, specifiers, decoratorPath)
    );
  });

  // Create new import declarations
  createNewImportDeclarations(
    j,
    root,
    decoratorsToImport,
    decoratorPathsImported
  );
}

/**
 * Get decorated props from `import` statements
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {File} root
 * @returns {Object}
 */
function getImportedDecoratedProps(j, root) {
  return getExistingDecoratorImports(j, root).reduce(
    (importedDecorators, decoratorImport) => {
      const { importPropDecoratorMap } = DECORATOR_PATHS[
        get(decoratorImport, "value.source.value")
      ];

      const specifiers = get(decoratorImport, "value.specifiers") || [];

      return specifiers.reduce((importedDecorators, specifier) => {
        if (isSpecifierDecorator(specifier, importPropDecoratorMap)) {
          importedDecorators[get(specifier, "local.name")] = getDecoratorInfo(
            specifier,
            importPropDecoratorMap
          );
        }
        return importedDecorators;
      }, importedDecorators);
    },
    {}
  );
}

module.exports = {
  createDecoratorImportDeclarations,
  getImportedDecoratedProps
};
