import type * as AST from './ast';
import type { TransformResult } from './eo-extend-expression';
import EOExtendExpression from './eo-extend-expression';
import {
  createDecoratorImportDeclarations,
  getDecoratorImportInfos as getExistingDecoratorImportInfos,
} from './import-helper';
import logger from './log-helper';
import type { Options, UserOptions } from './options';
import {
  getEOExtendExpressionCollection,
  mergeDecoratorImportSpecs,
} from './parse-helper';
import { getRuntimeData } from './runtime-data';
import type { DecoratorImportSpecs } from './util/index';

/** Main entry point for parsing and replacing ember objects */
export default function maybeTransformEmberObjects(
  root: AST.Collection,
  filePath: string,
  userOptions: UserOptions
): boolean {
  const options: Options = {
    ...userOptions,
    runtimeData: getRuntimeData(filePath),
  };

  const { results, decoratorImportSpecs } = _maybeTransformEmberObjects(
    root,
    filePath,
    options
  );

  for (const result of results) {
    if (!result.success) {
      throw new ValidationError(
        `Validation errors for class '${
          result.className
        }':\n\t\t${result.errors.join('\n\t\t')}`
      );
    }
  }

  const decoratorsToImport = Object.keys(decoratorImportSpecs).filter(
    (key) => decoratorImportSpecs[key as keyof DecoratorImportSpecs]
  );
  createDecoratorImportDeclarations(root, decoratorsToImport, options);

  return results.length > 0 && results.every((r) => r.success);
}

function _maybeTransformEmberObjects(
  root: AST.Collection,
  filePath: string,
  options: Options
): {
  results: TransformResult[];
  decoratorImportSpecs: DecoratorImportSpecs;
} {
  // Parse the import statements
  const existingDecoratorImportInfos = getExistingDecoratorImportInfos(root);
  const results: TransformResult[] = [];
  let decoratorImportSpecs: DecoratorImportSpecs = {
    action: false,
    classNames: false,
    classNameBindings: false,
    attributeBindings: false,
    layout: false,
    templateLayout: false,
    off: false,
    tagName: false,
    unobserves: false,
  };

  const eoExtendExpressionPaths = getEOExtendExpressionCollection(root);

  if (eoExtendExpressionPaths.length === 0) {
    logger.info({
      filePath,
      info: "UNMODIFIED: Did not find any 'EmberObject.extend()' expressions",
    });
  }

  // eslint-disable-next-line unicorn/no-array-for-each
  eoExtendExpressionPaths.forEach((eoExtendExpressionPath) => {
    const extendExpression = new EOExtendExpression(
      eoExtendExpressionPath,
      filePath,
      existingDecoratorImportInfos,
      options
    );

    const result = extendExpression.transform();
    results.push(result);

    if (result.success) {
      decoratorImportSpecs = mergeDecoratorImportSpecs(
        extendExpression.decoratorImportSpecs,
        decoratorImportSpecs
      );
    }
  });

  return { results, decoratorImportSpecs };
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
