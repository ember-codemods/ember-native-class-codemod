import type {
  CallExpression,
  ClassDeclaration,
  ClassProperty,
  CommentLine,
  Decorator,
  FunctionExpression,
  Identifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportSpecifier,
  JSCodeshift,
  MemberExpression,
  MethodDefinition,
  Node,
  Property,
} from 'jscodeshift';
import {
  createClassDecorator,
  createIdentifierDecorators,
  createInstancePropDecorators,
  withDecorators,
} from './decorator-helper';
import type { Action, EOBaseProp, EOProps } from './eo-prop';
import { EOClassDecoratorProp, EOFunctionExpressionProp } from './eo-prop';
import EOActionsObjectProp from './eo-prop/private/actions-object';
import EOCallExpressionProp from './eo-prop/private/call-expression';
import { DEFAULT_OPTIONS } from './options';
import type { EOCallExpressionMixin } from './parse-helper';
import {
  ACTION_SUPER_EXPRESSION_COMMENT,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} from './util';
import { assert, defined, isRecord, verified } from './util/types';

/** Returns true if class property should have value */
function shouldSetValue(prop: EOBaseProp | EOCallExpressionProp): boolean {
  if (!prop.hasDecorators) {
    return true;
  }
  return prop.decoratorNames.every(
    (decoratorName) =>
      decoratorName === 'className' || decoratorName === 'attribute'
  );
}

/** Copy comments `from` => `to` */
export function withComments<T extends Node>(
  to: T,
  from: { comments?: Node['comments'] | undefined }
): T {
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
 * @param methodDefinition - MethodDefinition to replace instances from
 * @param functionProp - Function expression to get the runtime data
 */
function replaceSuperExpressions(
  j: JSCodeshift,
  methodDefinition: MethodDefinition,
  functionProp: FunctionProp,
  { isAction = false }
): MethodDefinition {
  const replaceWithUndefined = functionProp.hasRuntimeData
    ? !functionProp.isOverridden
    : false;
  const superExprs = j(methodDefinition).find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      property: {
        type: 'Identifier',
        name: '_super',
      },
    },
  });

  if (superExprs.length === 0) {
    return methodDefinition;
  }
  // eslint-disable-next-line unicorn/no-array-for-each
  superExprs.forEach((superExpr) => {
    if (replaceWithUndefined) {
      j(superExpr).replaceWith(j.identifier('undefined'));
    } else {
      let superMethodCall: MemberExpression | CallExpression;
      const superMethodArgs = superExpr.value.arguments;
      if (functionProp.isComputed) {
        superMethodCall = j.memberExpression(j.super(), functionProp.key);
      } else if (isAction) {
        superMethodCall = j.callExpression(
          j.memberExpression(
            j.memberExpression(
              j.memberExpression(j.super(), j.identifier('actions')),
              methodDefinition.key
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
          j.memberExpression(j.super(), methodDefinition.key),
          superMethodArgs
        );
      }
      j(superExpr).replaceWith(superMethodCall);
    }
  });

  return methodDefinition;
}

type FunctionProp =
  | EOFunctionExpressionProp
  | (Property & {
      value: FunctionExpression;
      key: Identifier;
      hasRuntimeData?: boolean;
      isOverridden?: boolean;
      isComputed?: boolean;
    });

function isFunctionProp(prop: unknown): prop is FunctionProp {
  return (
    isRecord(prop) &&
    (prop['type'] === 'Property' || prop['type'] === 'FunctionExpression') &&
    isRecord(prop['value']) &&
    prop['value']['type'] === 'FunctionExpression' &&
    isRecord(prop['key']) &&
    prop['key']['type'] === 'Identifier'
  );
}

/**
 * Transform functions to class methods
 *
 * For example { foo: function() { }} --> { foo() { }}
 */
function createMethodProp(
  j: JSCodeshift,
  functionProp: FunctionProp,
  {
    isAction = false,
    decorators = [],
  }: { isAction?: boolean; decorators?: Decorator[] } = {}
): MethodDefinition {
  const propKind =
    functionProp.kind === 'init' ? 'method' : defined(functionProp.kind);

  return withDecorators(
    withComments(
      replaceSuperExpressions(
        j,
        j.methodDefinition(propKind, functionProp.key, functionProp.value),
        functionProp,
        { isAction }
      ),
      functionProp
    ),
    decorators
  );
}

/** Create the class property from passed instance property */
function createClassProp(
  j: JSCodeshift,
  instanceProp: EOCallExpressionProp | EOBaseProp,
  decorators: Decorator[] = []
): ClassProperty {
  if (decorators.length === 0) {
    decorators = createInstancePropDecorators(j, instanceProp);
  }

  const classProp = withDecorators(
    withComments(
      j.classProperty(
        instanceProp.key,
        shouldSetValue(instanceProp) ? instanceProp.value : null,
        null
      ),
      instanceProp
    ),
    decorators
  );
  classProp.computed = instanceProp.computed;
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
  idAction: Action & { value: Identifier },
  decorators: Decorator[] = []
): MethodDefinition {
  const returnBlock = j.blockStatement([
    j.returnStatement(
      j.callExpression(
        j.memberExpression(idAction.value, j.identifier('call')),
        [j.thisExpression(), j.spreadElement(j.identifier('arguments'))]
      )
    ),
  ]);
  const expr = j.functionExpression(null, [], returnBlock);

  return withDecorators(
    withComments(j.methodDefinition('method', idAction.key, expr), idAction),
    decorators
  );
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
  actionsProp: EOActionsObjectProp
): MethodDefinition[] {
  const actionProps = actionsProp.properties;
  const overriddenActions = actionsProp.overriddenActions;
  const actionDecorators = createIdentifierDecorators(j);
  return actionProps.map((actionProp) => {
    if (actionProp.value.type === 'Identifier') {
      return convertIdentifierActionToMethod(
        j,
        actionProp as Action & { value: Identifier },
        actionDecorators
      );
    } else {
      assert(
        isFunctionProp(actionProp),
        'action prop expected to be FunctionProp'
      );
      actionProp.hasRuntimeData = actionsProp.hasRuntimeData;
      actionProp.isOverridden = overriddenActions.includes(actionProp.key.name);
      return createMethodProp(j, actionProp, {
        decorators: actionDecorators,
        isAction: true,
      });
    }
  });
}

/** Iterate and covert the computed properties to class methods */
function createCallExpressionProp(
  j: JSCodeshift,
  callExprProp: EOCallExpressionProp
): MethodDefinition[] | ClassProperty[] {
  const callExprArgs = [...callExprProp.arguments];
  if (callExprProp.shouldRemoveLastArg) {
    const callExprLastArg = defined(callExprArgs.pop());
    const lastArgType = callExprLastArg.type;

    if (lastArgType === 'FunctionExpression') {
      const functionExpr = {
        __FAKE: true,
        isComputed: true,
        kind: callExprProp.kind,
        key: callExprProp.key,
        value: callExprLastArg,
        comments: callExprProp.comments,
        type: 'FunctionExpression', // FIXME: Make an actual Property
      };
      return [
        createMethodProp(j, verified(functionExpr, isFunctionProp), {
          decorators: createInstancePropDecorators(j, callExprProp),
        }),
      ];
    } else if (lastArgType === 'ObjectExpression') {
      const callExprMethods = callExprLastArg.properties.map(
        (callExprFunction) => {
          // FIXME: Clean up all these asserts. Generally check all asserts/verified/etc
          // assert('isComputed' in callExprFunction); FIXME: This doesn't work
          // @ts-expect-error
          callExprFunction.isComputed = true;
          assert('kind' in callExprFunction);
          assert('key' in callExprFunction);
          assert('name' in callExprFunction.key);
          assert(typeof callExprFunction.key.name === 'string');
          assert(
            (['init', 'method', 'get', 'set'] as const).includes(
              callExprFunction.key.name as 'init' | 'method' | 'get' | 'set'
            )
          );
          callExprFunction.kind = callExprFunction.key.name as
            | 'init'
            | 'method'
            | 'get'
            | 'set';
          callExprFunction.key = callExprProp.key;
          if (
            'value' in callExprFunction &&
            'params' in callExprFunction.value
          ) {
            callExprFunction.value.params.shift();
          }
          return createMethodProp(
            j,
            verified(callExprFunction, isFunctionProp)
          );
        }
      );

      withDecorators(
        withComments(defined(callExprMethods[0]), callExprProp),
        createInstancePropDecorators(j, callExprProp)
      );
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
  mixins: EOCallExpressionMixin[] = []
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
  superClassName = '',
  mixins: EOCallExpressionMixin[] = [],
  options = DEFAULT_OPTIONS
): ClassDeclaration {
  let classBody: Parameters<typeof j.classBody>[0] = [];
  const classDecorators: Decorator[] = [];

  if (options.classicDecorator) {
    classDecorators.push(j.decorator(j.identifier('classic')));
  }

  for (const prop of instanceProps) {
    if (prop instanceof EOClassDecoratorProp) {
      classDecorators.push(createClassDecorator(j, prop));
    } else if (prop instanceof EOFunctionExpressionProp) {
      classBody.push(createMethodProp(j, prop));
    } else if (prop instanceof EOCallExpressionProp) {
      classBody = [...classBody, ...createCallExpressionProp(j, prop)];
    } else if (prop instanceof EOActionsObjectProp) {
      classBody = [...classBody, ...createActionDecoratedProps(j, prop)];
    } else {
      classBody.push(createClassProp(j, prop));
    }
  }

  return withDecorators(
    j.classDeclaration(
      className ? j.identifier(className) : null,
      j.classBody(classBody),
      createSuperClassExpression(j, superClassName, mixins)
    ),
    classDecorators
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
