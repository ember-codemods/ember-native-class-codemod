import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import type {
  ASTNode,
  CallExpression,
  ClassMethod,
  Collection,
  CommentLine,
  Decorator,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  MemberExpression,
} from './ast';
import { findPaths, isEOSuperExpression } from './ast';
import type { EOCallExpressionProp } from './eo-prop/index';
import type { EOFunctionExpressionProp, EOMethodProp } from './eo-prop/index';
import {
  ACTION_SUPER_EXPRESSION_COMMENT,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from './util/index';
import { defined } from './util/types';

/** Copy comments `from` => `to` */
export function withComments<
  T extends Extract<ASTNode, { comments?: unknown }>
>(to: T, from: { comments?: T['comments'] | undefined }): T {
  if (from.comments) {
    to.comments = from.comments;
  } else {
    delete to.comments;
  }
  return to;
}

/** Creates line comments from passed lines */
function createLineComments(
  j: JSCodeshift,
  lines: readonly string[] = []
): CommentLine[] {
  return lines.map((line) => j.commentLine(line));
}

/**
 * Replace instances of `this._super(...arguments)` to `super.methodName(...arguments)`
 *
 * @param j - jscodeshift lib reference
 * @param classMethod - ClassMethod to replace instances from
 * @param functionProp - Function expression to get the runtime data
 */
export function replaceSuperExpressions(
  classMethod: ClassMethod,
  functionProp: EOMethodProp | EOFunctionExpressionProp | EOCallExpressionProp,
  { isAction = false, isComputed = false }
): ClassMethod {
  const replaceWithUndefined = functionProp.hasRuntimeData
    ? !functionProp.isOverridden
    : false;

  const superExpressionCollection = findPaths(
    j(classMethod) as Collection,
    j.CallExpression,
    isEOSuperExpression
  );

  if (superExpressionCollection.length === 0) {
    return classMethod;
  }
  // eslint-disable-next-line unicorn/no-array-for-each
  superExpressionCollection.forEach((superExpressionPath) => {
    if (replaceWithUndefined) {
      j(superExpressionPath).replaceWith(j.identifier('undefined'));
    } else {
      let superMethodCall: MemberExpression | CallExpression;
      const superMethodArgs = superExpressionPath.value.arguments;
      if (isComputed || functionProp.isComputed) {
        superMethodCall = j.memberExpression(j.super(), functionProp.key);
      } else if (isAction) {
        superMethodCall = j.callExpression(
          j.memberExpression(
            j.memberExpression(
              j.memberExpression(j.super(), j.identifier('actions')),
              classMethod.key
            ),
            j.identifier('call')
          ),
          [j.thisExpression(), ...superMethodArgs]
        );
        superMethodCall.comments = createLineComments(
          j,
          ACTION_SUPER_EXPRESSION_COMMENT
        );
      } else {
        superMethodCall = j.callExpression(
          j.memberExpression(j.super(), classMethod.key),
          superMethodArgs
        );
      }
      j(superExpressionPath).replaceWith(superMethodCall);
    }
  });

  return classMethod;
}

/**
 * Transform functions to class methods
 *
 * For example { foo: function() { }} --> { foo() { }}
 */
export function createMethodProp(
  j: JSCodeshift,
  functionProp: EOMethodProp | EOFunctionExpressionProp,
  {
    isAction = false,
    decorators = [],
  }: { isAction?: boolean; decorators?: Decorator[] } = {}
): ClassMethod {
  const kind =
    functionProp.kind === 'init' ? 'method' : defined(functionProp.kind);

  const existingDecorators = functionProp.existingDecorators;

  const allDecorators = [...(existingDecorators ?? []), ...decorators];

  return replaceSuperExpressions(
    j.classMethod.from({
      kind,
      key: functionProp.key,
      params: functionProp.params,
      body: functionProp.body,
      comments: functionProp.comments ?? null,
      decorators: allDecorators,
    }),
    functionProp,
    { isAction }
  );
}

/** Create import statement */
export function createImportDeclaration(
  j: JSCodeshift,
  specifiers: Array<ImportSpecifier | ImportDefaultSpecifier>,
  path: string
): ImportDeclaration {
  return j.importDeclaration(specifiers, j.literal(path));
}

/**
 * Matches the decorators for the current path with the `decoratorsToImport`,
 * and creates import specifiers for the matching decorators
 */
export function createEmberDecoratorSpecifiers(
  j: JSCodeshift,
  pathSpecifiers: string[] = [],
  decoratorsToImport: string[] = []
): ImportSpecifier[] {
  return pathSpecifiers
    .filter((specifier) => decoratorsToImport.includes(specifier))
    .map((specifier) => {
      const importedSpecifier =
        specifier === LAYOUT_DECORATOR_LOCAL_NAME
          ? LAYOUT_DECORATOR_NAME
          : specifier;
      return j.importSpecifier(
        j.identifier(importedSpecifier),
        j.identifier(specifier)
      );
    });
}
