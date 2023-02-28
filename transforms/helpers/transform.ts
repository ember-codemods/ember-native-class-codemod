import { getTelemetryFor } from 'ember-codemods-telemetry-helpers';
import path from 'path';
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
import { RuntimeDataSchema } from './runtime-data';
import type { DecoratorImportSpecs } from './util/index';
import { isFileOfType, isTestFile } from './validation-helper';

/** Main entry point for parsing and replacing ember objects */
export default function maybeTransformEmberObjects(
  root: AST.Collection,
  filePath: string,
  userOptions: UserOptions
): boolean | undefined {
  if (isTestFile(filePath)) {
    logger.warn(`[${filePath}]: SKIPPED: test file`);
    return;
  }

  if (userOptions.type && !isFileOfType(filePath, userOptions.type)) {
    logger.warn(
      `[${filePath}]: SKIPPED: Type mismatch, expected type '${userOptions.type}' did not match type of file`
    );
    return;
  }

  const rawTelemetry = getTelemetryFor(path.resolve(filePath));
  if (!rawTelemetry) {
    logger.warn(
      `[${filePath}]: SKIPPED \nCould not find runtime data NO_RUNTIME_DATA`
    );
    return;
  }

  let runtimeData;
  const result = RuntimeDataSchema.safeParse(rawTelemetry);
  if (result.success) {
    runtimeData = result.data;
  } else {
    const { errors } = result.error;
    const messages = errors.map((error) => {
      return `[${error.path.join('.')}]: ${error.message}`;
    });
    logger.warn(
      `[${filePath}]: SKIPPED \nCould not parse runtime data: \n\t${messages.join(
        '\n\t'
      )}`
    );
    return;
  }

  const options: Options = {
    ...userOptions,
    runtimeData,
  };

  const { results, decoratorImportSpecs } = _maybeTransformEmberObjects(
    root,
    filePath,
    options
  );

  let transformed = results.length > 0 && results.every((r) => r.success);

  for (const result of results) {
    if (result.success) {
      if (options.partialTransforms) {
        transformed = true;
        logger.info(
          `[${filePath}]: SUCCESS: Transformed class '${result.className}' with no errors`
        );
      } else {
        logger.error(
          `[${filePath}]: FAILURE \nCould not transform class '${result.className}'. Need option '--partial-transforms=true'`
        );
      }
    } else {
      const message = result.errors.join('\n\t');
      logger.error(
        `[${filePath}]: FAILURE \nValidation errors for class '${result.className}': \n\t${message}`
      );
    }
  }

  const decoratorsToImport = Object.keys(decoratorImportSpecs).filter(
    (key) => decoratorImportSpecs[key as keyof DecoratorImportSpecs]
  );
  createDecoratorImportDeclarations(root, decoratorsToImport, options);

  return transformed;
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
    logger.warn(
      `[${filePath}]: SKIPPED: Did not find any 'EmberObject.extend()' expressions`
    );
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
