import camelCase from 'camelcase';
import { getTelemetryFor } from 'ember-codemods-telemetry-helpers';
import path from 'path';
// @ts-expect-error FIXME
import EOProp from './EOProp';
// @ts-expect-error FIXME
import { createDecoratorImportDeclarations, getImportedDecoratedProps } from './import-helper';
// @ts-expect-error FIXME
import logger from './log-helper';
import type {
  ASTPath,
  CallExpression,
  Collection,
  JSCodeshift,
  ObjectExpression,
  VariableDeclaration,
} from 'jscodeshift';
// @ts-expect-error FIXME
import { createClass, withComments } from './transform-helper';
import { DEFAULT_OPTIONS } from './options';
import type { RuntimeData } from './runtime-data';
// @ts-expect-error FIXME
import { capitalizeFirstLetter, get, startsWithUpperCaseLetter } from './util';
import { isRecord, verified } from './util/types';
// @ts-expect-error FIXME
import { hasValidProps, isFileOfType, isTestFile } from './validation-helper';

interface EOProps {
  instanceProps: EOProp[];
}

/**
 * Return the map of instance props and functions from Ember Object
 *
 * For example
 * const myObj = EmberObject.extend({ key: value });
 * will be parsed as:
 * {
 *   instanceProps: [ Property({key: value}) ]
 *  }
 */
// FIXME: Why export?
export function getEmberObjectProps(
  _j: JSCodeshift, // FIXME: Remove?
  eoExpression: ObjectExpression | null,
  importedDecoratedProps = {},
  runtimeData = {}
): EOProps {
  const objProps = get(eoExpression, 'properties') || [];

  return {
    instanceProps: objProps.map(
      // @ts-expect-error
      (objProp) => new EOProp(objProp, runtimeData, importedDecoratedProps)
    ),
  };
}

interface DecoratorsToImportMap {
  action?: unknown;
  classNames?: unknown;
  classNameBindings?: unknown;
  attributeBindings?: unknown;
  layout?: unknown;
  templateLayout?: unknown;
  off?: unknown;
  tagName?: unknown;
  unobserves?: unknown;
}

/**
 * Get the map of decorators to import other than the computed props, services etc
 * which already have imports in the code
 */
function getDecoratorsToImportMap(
  instanceProps: EOProp[],
  decoratorsMap: DecoratorsToImportMap = {}
): DecoratorsToImportMap {
  return instanceProps.reduce((specs, prop) => {
    return {
      action: specs.action || prop.isActions,
      classNames: specs.classNames || prop.isClassNames,
      classNameBindings: specs.classNameBindings || prop.isClassNameBindings,
      attributeBindings: specs.attributeBindings || prop.isAttributeBindings,
      layout: specs.layout || prop.isLayoutDecorator,
      templateLayout: specs.templateLayout || prop.isTemplateLayoutDecorator,
      off: specs.off || prop.hasOffDecorator,
      tagName: specs.tagName || prop.isTagName,
      unobserves: specs.unobserves || prop.hasUnobservesDecorator,
    };
  }, decoratorsMap);
}

/** Find the `EmberObject.extend` statements */
// FIXME: Why export?
export function getEmberObjectCallExpressions(
  j: JSCodeshift,
  root: Collection<unknown>
): Collection<CallExpression> {
  return root
    .find(j.CallExpression, { callee: { property: { name: 'extend' } } })
    .filter(
      (eoCallExpression) =>
        startsWithUpperCaseLetter(get(eoCallExpression, 'value.callee.object.name')) &&
        get(eoCallExpression, 'parentPath.value.type') !== 'ClassDeclaration'
    );
}

/** Return closest parent var declaration statement */
export function getClosestVariableDeclaration(
  j: JSCodeshift,
  eoCallExpression: ASTPath<CallExpression>
  // FIXME: Verify return type
): ASTPath<VariableDeclaration> {
  const varDeclarations = j(eoCallExpression).closest(j.VariableDeclaration);
  return varDeclarations.length > 0 ? varDeclarations.get() : null;
}

/**
 * Get the expression to replace
 *
 * It returns either VariableDeclaration or the CallExpression depending on how the object is created
 */
export function getExpressionToReplace(
  j: JSCodeshift,
  eoCallExpression: ASTPath<CallExpression>
  // FIXME: Verify return type
): ASTPath<CallExpression> | ASTPath<VariableDeclaration> {
  const varDeclaration = getClosestVariableDeclaration(j, eoCallExpression);
  const isFollowedByCreate = get(eoCallExpression, 'parentPath.value.property.name') === 'create';

  let expressionToReplace:
    | ASTPath<CallExpression>
    | ASTPath<VariableDeclaration> = eoCallExpression;
  if (varDeclaration && !isFollowedByCreate) {
    expressionToReplace = varDeclaration;
  }
  return expressionToReplace;
}

/** Returns name of class to be created */
export function getClassName(
  j: JSCodeshift,
  eoCallExpression: ASTPath<CallExpression>,
  filePath: string,
  type = ''
) {
  const varDeclaration = getClosestVariableDeclaration(j, eoCallExpression);
  const classVariableName = get(varDeclaration, 'value.declarations.0.id.name');

  if (classVariableName) {
    return classVariableName;
  }

  let className = capitalizeFirstLetter(camelCase(path.basename(filePath, 'js')));
  const capitalizedType = capitalizeFirstLetter(type);

  if (capitalizedType === className) {
    className = capitalizeFirstLetter(camelCase(path.basename(path.dirname(filePath))));
  }

  if (!['Component', 'Helper', 'EmberObject'].includes(type)) {
    className = `${className}${capitalizedType}`;
  }

  return className;
}

type EOCallExpressionArgs = ASTPath<CallExpression>['value']['arguments'];

type EOCallExpressionArg = EOCallExpressionArgs[number];

type EOCallExpressionMixin = Exclude<EOCallExpressionArg, ObjectExpression>;

interface EOCallExpressionProps {
  eoExpression: ObjectExpression | null;
  mixins: EOCallExpressionMixin[];
}

/**
 * Parse ember object call expression, returns EmberObjectExpression and list of mixins
 */
function parseEmberObjectCallExpression(
  eoCallExpression: ASTPath<CallExpression>
): EOCallExpressionProps {
  const callExpressionArgs = eoCallExpression.value.arguments;
  const props: EOCallExpressionProps = {
    eoExpression: null,
    mixins: [],
  };
  callExpressionArgs.forEach((callExpressionArg) => {
    if (callExpressionArg.type === 'ObjectExpression') {
      props.eoExpression = callExpressionArg;
    } else {
      props.mixins.push(callExpressionArg);
    }
  });
  return props;
}

/** Main entry point for parsing and replacing ember objects */
export function replaceEmberObjectExpressions(
  j: JSCodeshift,
  root: Collection<unknown>,
  filePath: string,
  options = DEFAULT_OPTIONS
): boolean | undefined {
  options.runtimeData = verified<RuntimeData>(getTelemetryFor(path.resolve(filePath)), isRecord);

  if (!options.runtimeData) {
    logger.warn(`[${filePath}]: SKIPPED Could not find runtime data NO_RUNTIME_DATA`);
    return;
  }

  if (isTestFile(filePath)) {
    logger.warn(`[${filePath}]: Skipping test file`);
    return;
  }

  if (options.type && !isFileOfType(filePath, options.type)) {
    logger.warn(
      `[${filePath}]: FAILURE Type mismatch, expected type '${options.type}' did not match type of file`
    );
    return;
  }
  // Parse the import statements
  const importedDecoratedProps = getImportedDecoratedProps(j, root);
  let transformed = false;
  let decoratorsToImportMap: DecoratorsToImportMap = {};

  getEmberObjectCallExpressions(j, root).forEach((eoCallExpression) => {
    const { eoExpression, mixins } = parseEmberObjectCallExpression(eoCallExpression);

    const eoProps = getEmberObjectProps(
      j,
      eoExpression,
      importedDecoratedProps,
      options.runtimeData
    );

    const errors = hasValidProps(j, eoProps, options);

    if (get(eoCallExpression, 'parentPath.value.type') === 'MemberExpression') {
      errors.push('class has chained definition (e.g. EmberObject.extend().reopenClass();');
    }

    if (errors.length) {
      logger.warn(`[${filePath}]: FAILURE \nValidation errors: \n\t${errors.join('\n\t')}`);
      return;
    }

    let className = getClassName(j, eoCallExpression, filePath, get(options, 'runtimeData.type'));

    const superClassName = get(eoCallExpression, 'value.callee.object.name');

    if (className === superClassName) {
      className = `_${className}`;
    }

    const es6ClassDeclaration = createClass(j, className, eoProps, superClassName, mixins, options);

    const expressionToReplace = getExpressionToReplace(j, eoCallExpression);
    j(expressionToReplace).replaceWith(
      withComments(es6ClassDeclaration, expressionToReplace.value)
    );

    transformed = true;

    decoratorsToImportMap = getDecoratorsToImportMap(eoProps.instanceProps, decoratorsToImportMap);
  });

  // Need to find another way, as there might be a case where
  // one object from a file is transformed and other is not
  if (transformed) {
    const decoratorsToImport = Object.keys(decoratorsToImportMap).filter(
      (key) => decoratorsToImportMap[key as keyof DecoratorsToImportMap]
    );
    createDecoratorImportDeclarations(j, root, decoratorsToImport, options);
    logger.info(`[${filePath}]: SUCCESS`);
  }
  return transformed;
}
