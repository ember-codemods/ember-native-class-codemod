import camelCase from 'camelcase';
import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import path from 'path';
import type {
  ASTPath,
  Collection,
  RawEOExtendExpression,
  VariableDeclaration,
} from './ast';
import { findPaths, getFirstPath, isEOExtendExpression } from './ast';
import { capitalizeFirstLetter } from './util/index';
import { assert, defined, isRecord } from './util/types';

export interface DecoratorImportSpecs {
  action: boolean;
  classNames: boolean;
  classNameBindings: boolean;
  attributeBindings: boolean;
  layout: boolean;
  templateLayout: boolean;
  off: boolean;
  tagName: boolean;
  unobserves: boolean;
}

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
    unobserves: existing.unobserves || newSpecs.unobserves,
  };
}

/** Find the `EmberObject.extend` statements */
export function getEOExtendExpressionCollection(
  j: JSCodeshift,
  root: Collection
): Collection<RawEOExtendExpression> {
  return findPaths(root, j.CallExpression, isEOExtendExpression).filter(
    (path: ASTPath) => path.parentPath?.value.type !== 'ClassDeclaration'
  );
}

/** Return closest parent var declaration statement */
function getClosestVariableDeclaration(
  j: JSCodeshift,
  eoExtendExpressionPath: ASTPath<RawEOExtendExpression>
): ASTPath<VariableDeclaration> | null {
  const varDeclarations = j(eoExtendExpressionPath).closest(
    j.VariableDeclaration
  );
  return getFirstPath(varDeclarations) ?? null;
}

/**
 * Get the expression to replace
 *
 * It returns either VariableDeclaration or the CallExpression depending on how the object is created
 */
export function getExpressionToReplace(
  j: JSCodeshift,
  eoExtendExpressionPath: ASTPath<RawEOExtendExpression>
): ASTPath<RawEOExtendExpression> | ASTPath<VariableDeclaration> {
  const varDeclaration = getClosestVariableDeclaration(
    j,
    eoExtendExpressionPath
  );
  const parentValue = eoExtendExpressionPath.parentPath?.value;
  const isFollowedByCreate =
    isRecord(parentValue) &&
    isRecord(parentValue.property) &&
    parentValue.property['name'] === 'create';

  let expressionToReplace:
    | ASTPath<RawEOExtendExpression>
    | ASTPath<VariableDeclaration> = eoExtendExpressionPath;
  if (varDeclaration && !isFollowedByCreate) {
    expressionToReplace = varDeclaration;
  }
  return expressionToReplace;
}

/** Returns name of class to be created */
export function getClassName(
  eoExtendExpressionPath: ASTPath<RawEOExtendExpression>,
  filePath: string,
  type = ''
): string {
  const varDeclaration = getClosestVariableDeclaration(
    j,
    eoExtendExpressionPath
  );
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

  let className = capitalizeFirstLetter(
    camelCase(path.basename(filePath, 'js'))
  );
  const capitalizedType = capitalizeFirstLetter(type);

  if (capitalizedType === className) {
    className = capitalizeFirstLetter(
      camelCase(path.basename(path.dirname(filePath)))
    );
  }

  if (!['Component', 'Helper', 'EmberObject'].includes(type)) {
    className = `${className}${capitalizedType}`;
  }

  return className;
}
