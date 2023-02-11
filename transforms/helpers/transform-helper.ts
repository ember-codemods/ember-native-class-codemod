import type { JSCodeshift } from 'jscodeshift';
import { default as j } from 'jscodeshift';
import type {
  ASTNode,
  CallExpression,
  ClassMethod,
  Collection,
  CommentLine,
  EOSuperExpression,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  MemberExpression,
} from './ast';
import { findPaths, isEOSuperExpression } from './ast';
import {
  ACTION_SUPER_EXPRESSION_COMMENT,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from './util/index';

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
 */
function replaceSuperExpressions(
  classMethod: ClassMethod,
  replaceWithUndefined: boolean,
  buildSuperMethodCall: (
    superMethodArgs: EOSuperExpression['arguments']
  ) => CallExpression | MemberExpression
): ClassMethod {
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
      const superMethodArgs = superExpressionPath.value.arguments;
      const superMethodCall = buildSuperMethodCall(superMethodArgs);
      j(superExpressionPath).replaceWith(superMethodCall);
    }
  });

  return classMethod;
}

/** FIXME */
export function replaceActionSuperExpressions(
  classMethod: ClassMethod,
  replaceWithUndefined: boolean
): ClassMethod {
  return replaceSuperExpressions(
    classMethod,
    replaceWithUndefined,
    (superMethodArgs) => {
      const superMethodCall = j.callExpression(
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
      return superMethodCall;
    }
  );
}

/** FIXME */
export function replaceComputedSuperExpressions(
  classMethod: ClassMethod,
  replaceWithUndefined: boolean,
  identifier: Identifier
): ClassMethod {
  return replaceSuperExpressions(classMethod, replaceWithUndefined, () =>
    j.memberExpression(j.super(), identifier)
  );
}

/** FIXME */
export function replaceMethodSuperExpression(
  classMethod: ClassMethod,
  replaceWithUndefined: boolean
): ClassMethod {
  return replaceSuperExpressions(
    classMethod,
    replaceWithUndefined,
    (superMethodArgs) => {
      return j.callExpression(
        j.memberExpression(j.super(), classMethod.key),
        superMethodArgs
      );
    }
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
