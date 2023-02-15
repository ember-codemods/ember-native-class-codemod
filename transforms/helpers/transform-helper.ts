import { default as j } from 'jscodeshift';
import * as AST from '../helpers/ast';
import {
  ACTIONS_NAME,
  ACTION_SUPER_EXPRESSION_COMMENT,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from './util/index';

/** Copy comments `from` => `to` */
export function withComments<T extends { comments?: unknown }>(
  to: T,
  from: { comments?: T['comments'] | undefined }
): T {
  if (from.comments) {
    to.comments = from.comments;
  } else {
    delete to.comments;
  }
  return to;
}

/** Creates line comments from passed lines */
function createLineComments(lines: readonly string[] = []): AST.CommentLine[] {
  return lines.map((line) => j.commentLine(line));
}

/**
 * Replace instances of `this._super(...arguments)` with the expression returned
 * by the provided callback.
 */
function replaceSuperExpressions(
  classMethod: AST.ClassMethod,
  replaceWithUndefined: boolean,
  buildSuperMethodCall: (
    superMethodArgs: AST.EOSuperExpression['arguments']
  ) => AST.CallExpression | AST.MemberExpression
): AST.ClassMethod {
  const superExpressionCollection = AST.findPaths(
    j(classMethod) as AST.Collection,
    j.CallExpression,
    AST.isEOSuperExpression
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

/**
 * Replaces `this._super(...arguments)` calls in actions with the appropriate
 * class `super` call and a helpful migration message.
 *
 * @example
 *
 * ```
 * // TODO: This call to super is within an action, and has to refer to the parent
 * // class's actions to be safe. This should be refactored to call a normal method
 * // on the parent class. If the parent class has not been converted to native
 * // classes, it may need to be refactored as well. See
 * // https://github.com/scalvert/ember-native-class-codemod/blob/master/README.md
 * // for more details.
 * super.actions.baz.call(this, ...arguments);
 * ```
 */
export function replaceActionSuperExpressions(
  classMethod: AST.ClassMethod,
  replaceWithUndefined: boolean
): AST.ClassMethod {
  return replaceSuperExpressions(
    classMethod,
    replaceWithUndefined,
    (superMethodArgs) => {
      const superMethodCall = j.callExpression(
        j.memberExpression(
          j.memberExpression(
            j.memberExpression(j.super(), j.identifier(ACTIONS_NAME)),
            classMethod.key
          ),
          j.identifier('call')
        ),
        [j.thisExpression(), ...superMethodArgs]
      );
      superMethodCall.comments = createLineComments(
        ACTION_SUPER_EXPRESSION_COMMENT
      );
      return superMethodCall;
    }
  );
}

/**
 * Replaces `this._super(...arguments)` calls with the appropriate class `super`
 * call for a getter or setter.
 *
 * @example
 * ```
 * super.getterName;
 * ```
 */
export function replaceGetterSetterSuperExpressions(
  classMethod: AST.ClassMethod,
  replaceWithUndefined: boolean,
  identifier: AST.Identifier
): AST.ClassMethod {
  return replaceSuperExpressions(classMethod, replaceWithUndefined, () =>
    j.memberExpression(j.super(), identifier)
  );
}

/**
 * Replaces `this._super(...arguments)` calls with the appropriate class `super`
 * call for a method.
 *
 * @example
 * ```
 * super.methodName(...arguments);
 * ```
 */
export function replaceMethodSuperExpression(
  classMethod: AST.ClassMethod,
  replaceWithUndefined: boolean
): AST.ClassMethod {
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
  specifiers: Array<AST.ImportSpecifier | AST.ImportDefaultSpecifier>,
  path: string
): AST.ImportDeclaration {
  return j.importDeclaration(specifiers, j.literal(path));
}

/**
 * Matches the decorators for the current path with the `decoratorsToImport`,
 * and creates import specifiers for the matching decorators
 */
export function createEmberDecoratorSpecifiers(
  pathSpecifiers: string[] = [],
  decoratorsToImport: string[] = []
): AST.ImportSpecifier[] {
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
