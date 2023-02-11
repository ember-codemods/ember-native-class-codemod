import { getTelemetryFor } from 'ember-codemods-telemetry-helpers';
import type { JSCodeshift } from 'jscodeshift';
import path from 'path';
import type { Collection } from './ast';
import EOExtendExpression from './eo-extend-expression';
import {
  createDecoratorImportDeclarations,
  getDecoratorImportInfos as getExistingDecoratorImportInfos,
} from './import-helper';
import logger from './log-helper';
import type { Options, UserOptions } from './options';
import type { DecoratorImportSpecs } from './parse-helper';
import {
  getEOExtendExpressionCollection,
  mergeDecoratorImportSpecs,
} from './parse-helper';
import { RuntimeDataSchema } from './runtime-data';
import { isFileOfType, isTestFile } from './validation-helper';

/** Main entry point for parsing and replacing ember objects */
export default function maybeTransformEmberObjects(
  j: JSCodeshift,
  root: Collection,
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

  const { transformed, decoratorImportSpecs } = _maybeTransformEmberObjects(
    j,
    root,
    filePath,
    options
  );

  // Need to find another way, as there might be a case where
  // one object from a file is transformed and other is not
  if (transformed) {
    const decoratorsToImport = Object.keys(decoratorImportSpecs).filter(
      (key) => decoratorImportSpecs[key as keyof DecoratorImportSpecs]
    );
    createDecoratorImportDeclarations(j, root, decoratorsToImport, options);
    logger.info(`[${filePath}]: SUCCESS`);
  }
  return transformed;
}

function _maybeTransformEmberObjects(
  j: JSCodeshift,
  root: Collection,
  filePath: string,
  options: Options
): {
  transformed: boolean;
  decoratorImportSpecs: DecoratorImportSpecs;
} {
  // Parse the import statements
  const existingDecoratorImportInfos = getExistingDecoratorImportInfos(j, root);
  let transformed = false;
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

  const eoExtendExpressionPaths = getEOExtendExpressionCollection(j, root);

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

    transformed = extendExpression.transform();

    decoratorImportSpecs = mergeDecoratorImportSpecs(
      extendExpression.decoratorImportSpecs,
      decoratorImportSpecs
    );
  });

  return { transformed, decoratorImportSpecs };
}
