import camelCase from 'camelcase';
import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import path from 'path';
import type {
  ASTPath,
  Collection,
  EOExpression,
  RawEOExtendExpression,
  VariableDeclaration,
} from './ast';
import { findPaths, getFirstPath, isEOExtendExpression } from './ast';
import type { DecoratorImportInfoMap } from './decorator-info';
import type { EOProp } from './eo-prop/index';
import makeEOProp, {
  EOActionsProp,
  EOClassDecoratorProp,
} from './eo-prop/index';
import type { Options } from './options';
import { capitalizeFirstLetter } from './util/index';
import { assert, defined, isRecord } from './util/types';

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
export function getEOProps(
  eoExpression: EOExpression | null,
  existingDecoratorImportInfos: DecoratorImportInfoMap,
  options: Options
): EOProp[] {
  const properties = eoExpression?.properties ?? [];
  return properties.map((property) =>
    makeEOProp(property, existingDecoratorImportInfos, options)
  );
}

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
export function getDecoratorsToImportSpecs(
  instanceProps: EOProp[],
  existingSpecs: DecoratorImportSpecs
): DecoratorImportSpecs {
  let specs = existingSpecs;
  for (const prop of instanceProps) {
    specs = {
      action: specs.action || prop instanceof EOActionsProp,
      classNames:
        specs.classNames ||
        (prop instanceof EOClassDecoratorProp && prop.isClassNames),
      classNameBindings:
        specs.classNameBindings ||
        (prop instanceof EOClassDecoratorProp && prop.isClassNameBindings),
      attributeBindings:
        specs.attributeBindings ||
        (prop instanceof EOClassDecoratorProp && prop.isAttributeBindings),
      layout:
        specs.layout ||
        (prop instanceof EOClassDecoratorProp && prop.isLayoutDecorator),
      templateLayout:
        specs.templateLayout ||
        (prop instanceof EOClassDecoratorProp &&
          prop.isTemplateLayoutDecorator),
      off: specs.off || prop.hasOffDecorator,
      tagName:
        specs.tagName ||
        (prop instanceof EOClassDecoratorProp && prop.isTagName),
      unobserves: specs.unobserves || prop.hasUnobservesDecorator,
    };
  }
  return specs;
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
