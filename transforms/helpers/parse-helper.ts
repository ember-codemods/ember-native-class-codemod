import { default as j } from 'jscodeshift';
import path from 'path';
import * as AST from './ast';
import { classify, type DecoratorImportSpecs } from './util/index';
import { assert, defined, isRecord } from './util/types';

const DO_NOT_SUFFIX = new Set(['Component', 'Helper', 'EmberObject']);

// List copied from ember-codemods-telemetry-helpers
const TELEMETRY_TYPES = new Set([
  'Application',
  'Controller',
  'Route',
  'Component',
  'Service',
  'Helper',
  'Router',
  'Engine',
  'EmberObject',
]);

/**
 * Get the map of decorators to import other than the computed props, services etc
 * which already have imports in the code
 */
export function mergeDecoratorImportSpecs(
  newSpecs: DecoratorImportSpecs,
  existing: DecoratorImportSpecs
): DecoratorImportSpecs {
  return {
    action: existing.action || newSpecs.action,
    classNames: existing.classNames || newSpecs.classNames,
    classNameBindings: existing.classNameBindings || newSpecs.classNameBindings,
    attributeBindings: existing.attributeBindings || newSpecs.attributeBindings,
    layout: existing.layout || newSpecs.layout,
    templateLayout: existing.templateLayout || newSpecs.templateLayout,
    off: existing.off || newSpecs.off,
    tagName: existing.tagName || newSpecs.tagName,
    observes: existing.observes || newSpecs.observes,
    unobserves: existing.unobserves || newSpecs.unobserves,
  };
}

/** Find the `EmberObject.extend` statements */
export function getEOExtendExpressionCollection(
  root: AST.Collection
): AST.Collection<AST.EOExtendExpression> {
  return AST.findPaths(root, j.CallExpression, AST.isEOExtendExpression).filter(
    (path: AST.Path) => path.parentPath?.value.type !== 'ClassDeclaration'
  );
}

/** Return closest parent var declaration statement */
function getClosestVariableDeclaration(
  eoExtendExpressionPath: AST.Path<AST.EOExtendExpression>
): AST.Path<AST.VariableDeclaration> | null {
  const varDeclarations = j(eoExtendExpressionPath).closest(
    j.VariableDeclaration
  );
  return AST.getFirstPath(varDeclarations) ?? null;
}

/**
 * Get the expression to replace
 *
 * It returns either VariableDeclaration or the CallExpression depending on how the object is created
 */
export function getExpressionToReplace(
  eoExtendExpressionPath: AST.Path<AST.EOExtendExpression>
): AST.Path<AST.EOExtendExpression> | AST.Path<AST.VariableDeclaration> {
  const varDeclaration = getClosestVariableDeclaration(eoExtendExpressionPath);
  const parentValue = eoExtendExpressionPath.parentPath?.value;
  const isFollowedByCreate =
    isRecord(parentValue) &&
    isRecord(parentValue.property) &&
    parentValue.property['name'] === 'create';

  let expressionToReplace:
    | AST.Path<AST.EOExtendExpression>
    | AST.Path<AST.VariableDeclaration> = eoExtendExpressionPath;
  if (varDeclaration && !isFollowedByCreate) {
    expressionToReplace = varDeclaration;
  }
  return expressionToReplace;
}

/** Returns name of class to be created */
export function getClassName(
  eoExtendExpressionPath: AST.Path<AST.EOExtendExpression>,
  filePath: string,
  superClassName: string,
  type: string | undefined
): string {
  const varDeclaration = getClosestVariableDeclaration(eoExtendExpressionPath);
  if (varDeclaration) {
    const firstDeclarator = defined(varDeclaration.value.declarations[0]);
    assert(
      firstDeclarator.type === 'VariableDeclarator',
      'expected firstDeclarator to be a VariableDeclarator'
    );

    const identifier = firstDeclarator.id;
    assert(
      identifier.type === 'Identifier',
      'expected firstDeclarator.id to be an Identifier'
    );

    return identifier.name;
  }

  let className = classify(path.basename(filePath, 'js'));

  // If type is undefined, this means we couldn't find the telemetry or the user
  // is running in NO_TELEMETRY mode. In this case, try to infer the type from
  // the super class name.
  if (!type) {
    superClassName = classify(superClassName);
    if (TELEMETRY_TYPES.has(superClassName)) {
      type = superClassName;
    }
  }

  if (type === className) {
    className = classify(path.basename(path.dirname(filePath)));
  }

  if (type && !DO_NOT_SUFFIX.has(type) && !className.endsWith(type)) {
    className = `${className}${type}`;
  }

  return className;
}
