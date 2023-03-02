import camelCase from 'camelcase';
import { default as j } from 'jscodeshift';
import path from 'path';
import * as AST from './ast';
import type { DecoratorImportSpecs } from './util/index';
import { capitalizeFirstLetter } from './util/index';
import { assert, defined, isRecord } from './util/types';

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
  type = ''
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

  let className = capitalizeFirstLetter(
    camelCase(path.basename(filePath, 'js'))
  );
  const capitalizedType = capitalizeFirstLetter(type);

  if (capitalizedType === className) {
    className = capitalizeFirstLetter(
      camelCase(path.basename(path.dirname(filePath)))
    );
  }

  if (
    !['Component', 'Helper', 'EmberObject'].includes(type) &&
    !className.endsWith(type)
  ) {
    className = `${className}${capitalizedType}`;
  }

  return className;
}
