import { getTelemetryFor } from 'ember-codemods-telemetry-helpers';
import type { Collection, JSCodeshift } from 'jscodeshift';
import path from 'path';
import {
  createDecoratorImportDeclarations,
  getDecoratorImportInfos as getExistingDecoratorImportInfos,
} from './import-helper';
import logger from './log-helper';
import type { Options, UserOptions } from './options';
import type { DecoratorImportSpecs } from './parse-helper';
import {
  getClassName,
  getDecoratorsToImportSpecs,
  getEmberObjectCallExpressions,
  getEmberObjectProps,
  getExpressionToReplace,
  parseEmberObjectCallExpression,
} from './parse-helper';
import { isRuntimeData } from './runtime-data';
import { createClass, withComments } from './transform-helper';
import { dig } from './util/index';
import { assert, isString, verified } from './util/types';
import { hasValidProps, isFileOfType, isTestFile } from './validation-helper';

/** Main entry point for parsing and replacing ember objects */
export default function maybeTransformEmberObjects(
  j: JSCodeshift,
  root: Collection<unknown>,
  filePath: string,
  userOptions: UserOptions
): boolean | undefined {
  if (isTestFile(filePath)) {
    logger.warn(`[${filePath}]: Skipping test file`);
    return;
  }

  if (userOptions.type && !isFileOfType(filePath, userOptions.type)) {
    logger.warn(
      `[${filePath}]: FAILURE Type mismatch, expected type '${userOptions.type}' did not match type of file`
    );
    return;
  }

  const runtimeData = getTelemetryFor(path.resolve(filePath));
  if (!runtimeData || !isRuntimeData(runtimeData)) {
    logger.warn(
      `[${filePath}]: SKIPPED Could not find runtime data NO_RUNTIME_DATA`
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
  root: Collection<unknown>,
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

  // eslint-disable-next-line unicorn/no-array-for-each
  getEmberObjectCallExpressions(j, root).forEach((eoCallExpression) => {
    const { eoExpression, mixins } =
      parseEmberObjectCallExpression(eoCallExpression);

    const eoProps = getEmberObjectProps(
      eoExpression,
      existingDecoratorImportInfos,
      options.runtimeData
    );

    const errors = hasValidProps(j, eoProps, options);

    if (
      dig(eoCallExpression, 'parentPath.value.type', isString) ===
      'MemberExpression'
    ) {
      errors.push(
        'class has chained definition (e.g. EmberObject.extend().reopenClass();'
      );
    }

    if (errors.length > 0) {
      logger.warn(
        `[${filePath}]: FAILURE \nValidation errors: \n\t${errors.join('\n\t')}`
      );
      return;
    }

    let className = getClassName(
      j,
      eoCallExpression,
      filePath,
      options.runtimeData?.type
    );

    const callee = eoCallExpression.value.callee;
    assert('object' in callee, 'expected object in callee');
    assert(
      callee.object && 'name' in callee.object,
      'expected object in callee.object'
    );
    const superClassName = verified(callee.object.name, isString);

    if (className === superClassName) {
      className = `_${className}`;
    }

    const es6ClassDeclaration = createClass(
      j,
      className,
      eoProps,
      superClassName,
      mixins,
      options
    );

    const expressionToReplace = getExpressionToReplace(j, eoCallExpression);
    j(expressionToReplace).replaceWith(
      withComments(es6ClassDeclaration, expressionToReplace.value)
    );

    transformed = true;

    decoratorImportSpecs = getDecoratorsToImportSpecs(
      eoProps.instanceProps,
      decoratorImportSpecs
    );
  });

  return { transformed, decoratorImportSpecs };
}
