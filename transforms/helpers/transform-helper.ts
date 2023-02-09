import type { JSCodeshift } from 'jscodeshift';
import type {
  ASTNode,
  CallExpression,
  ClassDeclaration,
  ClassMethod,
  ClassProperty,
  Collection,
  CommentLine,
  Decorator,
  EOActionProperty,
  EOMethod,
  EOMixin,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  MemberExpression,
} from './ast';
import {
  findPaths,
  isEOActionProperty,
  isEOMethod,
  isEOSuperExpression,
} from './ast';
import {
  createClassDecorator,
  createIdentifierDecorators,
  createInstancePropDecorators,
} from './decorator-helper';
import type { EOProps, EOSimpleProp } from './eo-prop/index';
import {
  EOActionsProp,
  EOCallExpressionProp,
  EOClassDecoratorProp,
  EOFunctionExpressionProp,
  EOMethodProp,
} from './eo-prop/index';
import type { Options } from './options';
import {
  ACTION_SUPER_EXPRESSION_COMMENT,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from './util/index';
import { assert, defined } from './util/types';

/** Returns true if class property should have value */
function shouldSetValue(prop: EOSimpleProp | EOCallExpressionProp): boolean {
  if (!prop.hasDecorators) {
    return true;
  }
  return prop.decoratorNames.every(
    (decoratorName) =>
      decoratorName === 'className' || decoratorName === 'attribute'
  );
}

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
function replaceSuperExpressions(
  j: JSCodeshift,
  classMethod: ClassMethod,
  functionProp: EOMethodProp | EOFunctionExpressionProp | FunctionProp,
  { isAction = false }
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
      if (functionProp.isComputed) {
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

interface FunctionProp {
  key: EOMethod['key'];
  params: EOMethod['params'];
  body: EOMethod['body'];
  hasRuntimeData?: boolean | undefined;
  isOverridden?: boolean | undefined;
  isComputed?: boolean | undefined;
  kind: 'init' | 'get' | 'set' | 'method' | undefined;
  comments: EOMethod['comments'] | undefined;
  decorators: EOMethod['decorators'] | undefined;
}

/**
 * Transform functions to class methods
 *
 * For example { foo: function() { }} --> { foo() { }}
 */
function createMethodProp(
  j: JSCodeshift,
  functionProp: EOMethodProp | EOFunctionExpressionProp | FunctionProp,
  {
    isAction = false,
    decorators = [],
  }: { isAction?: boolean; decorators?: Decorator[] } = {}
): ClassMethod {
  const kind =
    functionProp.kind === 'init' ? 'method' : defined(functionProp.kind);

  const existingDecorators =
    functionProp instanceof EOMethodProp ||
    functionProp instanceof EOFunctionExpressionProp
      ? functionProp.existingDecorators
      : functionProp.decorators;

  const allDecorators = [...(existingDecorators ?? []), ...decorators];

  return replaceSuperExpressions(
    j,
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

/** Create the class property from passed instance property */
function createClassProp(
  j: JSCodeshift,
  instanceProp: EOCallExpressionProp | EOSimpleProp,
  decorators: Decorator[] = []
): ClassProperty {
  if (decorators.length === 0) {
    decorators = createInstancePropDecorators(j, instanceProp);
  }

  if ('existingDecorators' in instanceProp) {
    decorators = [...(instanceProp.existingDecorators ?? []), ...decorators];
  }

  const classProp = j.classProperty.from({
    key: instanceProp.key,
    value: shouldSetValue(instanceProp) ? instanceProp.value : null,
    comments: instanceProp.comments ?? null,
    computed: instanceProp.computed,
  });

  // @ts-expect-error jscodeshift AST types are incorrect
  // If this ever gets fixed, check if the builder `.from` method above
  // will now take a decorators param.
  classProp.decorators = decorators;

  return classProp;
}

/**
 * Actions with identifier converted to method definition
 *
 * For example in case of following action
 * ```
 * import someActionUtil from 'some/action/util';
 *
 * const Foo = Component.extend({
 *   actions: {
 *     someActionUtil
 *   }
 * });
 * ```
 *
 * will be transformed to:
 *
 * ```
 * import someActionUtil from 'some/action/util';
 *
 * const Foo = Component.extend({
 *   @action
 *   someActionUtil() {
 *     return someActionUtil.call(this, ...arguments);
 *   }
 * });
 * ```
 */
function convertIdentifierActionToMethod(
  j: JSCodeshift,
  idAction: EOActionProperty,
  decorators: Decorator[] = []
): ClassMethod {
  const returnBlock = j.blockStatement([
    j.returnStatement(
      j.callExpression(
        j.memberExpression(idAction.value, j.identifier('call')),
        [j.thisExpression(), j.spreadElement(j.identifier('arguments'))]
      )
    ),
  ]);
  const expr = j.functionExpression(null, [], returnBlock);
  return j.classMethod.from({
    kind: 'method',
    key: idAction.key,
    params: expr.params,
    body: expr.body,
    comments: idAction.comments ?? null,
    decorators,
  });
}

/**
 * Create action decorators
 * ```
 * Converts
 * {
 *  actions: {
 *    foo() {}
 *  }
 * }
 * ```
 * to
 * ```
 * {
 *  @action
 *  foo(){ }
 * }
 * ```
 */
function createActionDecoratedProps(
  j: JSCodeshift,
  actionsProp: EOActionsProp,
  options: Options
): ClassMethod[] {
  const actionProps = actionsProp.properties;
  const overriddenActions = actionsProp.runtimeData.overriddenActions;
  const actionDecorators = createIdentifierDecorators(j);
  return actionProps.map((actionProp) => {
    if (isEOActionProperty(actionProp)) {
      return convertIdentifierActionToMethod(j, actionProp, actionDecorators);
    } else {
      const prop = new EOMethodProp(actionProp, options);
      prop.isOverridden = overriddenActions?.includes(actionProp.key.name);
      return createMethodProp(j, prop, {
        decorators: actionDecorators,
        isAction: true,
      });
    }
  });
}

/** Iterate and covert the computed properties to class methods */
function createCallExpressionProp(
  j: JSCodeshift,
  callExprProp: EOCallExpressionProp,
  options: Options
): ClassMethod[] | ClassProperty[] {
  const callExprArgs = [...callExprProp.arguments];
  if (callExprProp.shouldRemoveLastArg) {
    const lastArg = defined(callExprArgs.pop());

    if (lastArg.type === 'FunctionExpression') {
      const prop: FunctionProp = {
        isComputed: true,
        kind: callExprProp.kind,
        key: callExprProp.key,
        body: lastArg.body,
        params: lastArg.params,
        comments: callExprProp.comments,
        decorators: callExprProp.existingDecorators,
      };
      return [
        createMethodProp(j, prop, {
          decorators: createInstancePropDecorators(j, callExprProp),
        }),
      ];
    } else if (lastArg.type === 'ObjectExpression') {
      const callExprMethods = lastArg.properties.map((property) => {
        assert(isEOMethod(property), 'expected EOMethod');
        const prop = new EOMethodProp(property, options);
        prop.isComputed = true;
        assert(
          (['init', 'get', 'set', 'method'] as const).includes(
            prop.key.name as 'init' | 'get' | 'set' | 'method'
          )
        );
        prop.kind = prop.key.name as 'init' | 'get' | 'set' | 'method';
        prop.key = callExprProp.key;
        prop.value.params.shift();
        return createMethodProp(j, prop);
      });

      const firstMethod = defined(callExprMethods[0]);
      firstMethod.comments = callExprProp.comments ?? null;
      firstMethod.decorators = createInstancePropDecorators(j, callExprProp);

      return callExprMethods;
    } else {
      throw new Error(
        'Expected last argument in call expression to be a FunctionExpression or ObjectExpression'
      );
    }
  } else {
    return [createClassProp(j, callExprProp)];
  }
}

/** Create identifier for super class with mixins */
function createSuperClassExpression(
  j: JSCodeshift,
  superClassName = '',
  mixins: EOMixin[] = []
): CallExpression | Identifier {
  if (mixins.length > 0) {
    return j.callExpression(
      j.memberExpression(j.identifier(superClassName), j.identifier('extend')),
      mixins
    );
  }
  return j.identifier(superClassName);
}

/** Create the class */
export function createClass(
  j: JSCodeshift,
  className: string,
  { instanceProps }: EOProps,
  superClassName: string,
  mixins: EOMixin[],
  options: Options
): ClassDeclaration {
  let classBody: Parameters<typeof j.classBody>[0] = [];
  const classDecorators: Decorator[] = [];

  if (options.classicDecorator) {
    classDecorators.push(j.decorator(j.identifier('classic')));
  }

  for (const prop of instanceProps) {
    if (prop instanceof EOClassDecoratorProp) {
      classDecorators.push(createClassDecorator(j, prop));
    } else if (prop instanceof EOMethodProp) {
      classBody.push(createMethodProp(j, prop));
    } else if (prop instanceof EOFunctionExpressionProp) {
      classBody.push(createMethodProp(j, prop));
    } else if (prop instanceof EOCallExpressionProp) {
      classBody = [...classBody, ...createCallExpressionProp(j, prop, options)];
    } else if (prop instanceof EOActionsProp) {
      classBody = [
        ...classBody,
        ...createActionDecoratedProps(j, prop, options),
      ];
    } else {
      classBody.push(createClassProp(j, prop));
    }
  }

  const classDeclaration = j.classDeclaration.from({
    id: className ? j.identifier(className) : null,
    body: j.classBody(classBody),
    superClass: createSuperClassExpression(j, superClassName, mixins),
  });

  // @ts-expect-error jscodeshift AST types are incorrect
  // If this ever gets fixed, check if the builder `.from` method above
  // will now take a decorators param.
  classDeclaration.decorators = classDecorators;

  return classDeclaration;
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
