import type { JSCodeshift } from 'jscodeshift';
import minimatch from 'minimatch';
import type { Decorator } from './ast';
import {
  findPaths,
  isEOActionMethod,
  isNode,
  makeEOActionInfiniteCallAssertion,
  makeEOActionInfiniteLiteralAssertion,
} from './ast';
import type { EOProps } from './eo-prop/index';
import {
  EOActionsProp,
  EOCallExpressionProp,
  EOClassDecoratorProp,
  EOMethodProp,
  EOSimpleProp,
} from './eo-prop/index';
import type { Options } from './options';
import {
  ALLOWED_OBJECT_LITERAL_DECORATORS,
  LIFECYCLE_HOOKS,
} from './util/index';
import { assert } from './util/types';

const UNSUPPORTED_PROP_NAMES = ['actions', 'layout'] as const;

const TYPE_PATTERNS = {
  service: '**/services/**/*.js',
  services: '**/services/**/*.js',
  controller: '**/controllers/**/*.js',
  controllers: '**/controllers/**/*.js',
  component: '**/components/**/*.js',
  components: '**/components/**/*.js',
  route: '**/routes/**/*.js',
  routes: '**/routes/**/*.js',
} as const;

const TEST_FILE_PATTERN = '**/*-test.js' as const;

/** Returns true if the specified file is a test file */
export function isTestFile(file: string): boolean {
  return minimatch(file, TEST_FILE_PATTERN);
}

/**
 * Returns true if the given path matches the type of ember object
 * The glob patterns are specified by `TYPE_PATTERNS`
 */
export function isFileOfType(file: string, type: Options['type']): boolean {
  return (
    // False positive
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !!type && !!TYPE_PATTERNS[type] && minimatch(file, TYPE_PATTERNS[type])
  );
}

/**
 * Iterates through instance properties to verify if there are any props that
 * can not be transformed
 */
export function hasValidProps(
  j: JSCodeshift,
  { instanceProps }: EOProps,
  { decorators, classFields }: Options
): string[] {
  const unsupportedPropNames: readonly string[] = decorators
    ? []
    : UNSUPPORTED_PROP_NAMES;

  let errors: string[] = [];
  for (const instanceProp of instanceProps) {
    if (instanceProp instanceof EOSimpleProp) {
      if (!classFields) {
        errors.push(
          `[${instanceProp.name}]: Need option '--class-fields=true'`
        );
      }

      if (
        (instanceProp.type === 'ObjectExpression' ||
          instanceProp.type === 'ArrayExpression') &&
        instanceProp.name !== 'queryParams'
      ) {
        errors.push(
          `[${instanceProp.name}]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects`
        );
      }
    }

    if (instanceProp.existingDecorators) {
      for (const decorator of instanceProp.existingDecorators) {
        const decoratorName = getDecoratorName(decorator);
        if (!ALLOWED_OBJECT_LITERAL_DECORATORS.has(decoratorName)) {
          errors.push(
            `[${instanceProp.name}]: Transform not supported - decorator "@${decoratorName}" not included in ALLOWED_OBJECT_LITERAL_DECORATORS`
          );
        }
      }

      if (
        !(
          instanceProp instanceof EOSimpleProp ||
          instanceProp instanceof EOMethodProp
        )
      ) {
        errors.push(
          `[${instanceProp.name}]: Transform not supported - can only transform object literal property decorators on primitives and methods`
        );
      }
    }

    if (instanceProp instanceof EOActionsProp) {
      errors = [...errors, ...getLifecycleHookErrors(instanceProp)];
      errors = [...errors, ...getInfiniteLoopErrors(j, instanceProp)];
    }

    if (
      !decorators &&
      (instanceProp.existingDecorators ||
        instanceProp.hasDecorators ||
        instanceProp instanceof EOClassDecoratorProp ||
        instanceProp instanceof EOCallExpressionProp)
    ) {
      errors.push(
        `[${instanceProp.name}]: Transform not supported - need option '--decorators=true'`
      );
    }

    if (unsupportedPropNames.includes(instanceProp.name)) {
      errors.push(
        `[${instanceProp.name}]: Transform not supported - property with name '${instanceProp.name}' and type ${instanceProp.type} can not be transformed`
      );
    }

    if (instanceProp instanceof EOCallExpressionProp) {
      if (!instanceProp.hasDecorators) {
        errors.push(
          `[${instanceProp.name}]: Transform not supported - call to '${instanceProp.calleeName}' can not be transformed`
        );
      }

      if (instanceProp.hasModifierWithArgs) {
        errors.push(
          `[${instanceProp.name}]: Transform not supported - value has modifiers like 'property' or 'meta'`
        );
      }

      if (instanceProp.hasVolatile && instanceProp.hasMetaDecorator) {
        errors.push(
          `[${instanceProp.name}]: Transform not supported - value has 'volatile' modifier with computed meta ('@ember/object/computed') is not supported`
        );
      }
    }
  }
  return errors;
}

/**
 * Iterate over actions and verify that the action name does not match the lifecycle hooks
 * The transformation is not supported if an action has the same name as lifecycle hook
 * Reference: https://github.com/scalvert/ember-native-class-codemod/issues/34
 */
function getLifecycleHookErrors(actionsProp: EOActionsProp): string[] {
  const actionProps = actionsProp.properties;
  const errors: string[] = [];
  for (const actionProp of actionProps) {
    const actionName = actionProp.key.name;
    if (LIFECYCLE_HOOKS.has(actionName)) {
      errors.push(
        `[${actionName}]: Transform not supported - action name matches one of the lifecycle hooks. Rename and try again. See https://github.com/scalvert/ember-native-class-codemod/issues/34 for more details`
      );
    }
  }
  return errors;
}

/**
 * Validation against pattern mentioned https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2
 */
function getInfiniteLoopErrors(
  j: JSCodeshift,
  actionsProp: EOActionsProp
): string[] {
  const actionProps = actionsProp.properties;
  const errors: string[] = [];
  for (const actionProp of actionProps) {
    const actionName = actionProp.key.name;
    if (isEOActionMethod(actionProp)) {
      const collection = j(actionProp.body);

      // Occurrences of this.actionName()
      const isEOActionInfiniteCall =
        makeEOActionInfiniteCallAssertion(actionName);
      const actionCalls = findPaths(
        collection,
        j.CallExpression,
        isEOActionInfiniteCall
      );

      // Occurrences of this.get('actionName')() or get(this, 'actionName')()
      const isEOActionInfiniteLiteral =
        makeEOActionInfiniteLiteralAssertion(actionName);
      const actionLiterals = findPaths(
        collection,
        j.StringLiteral,
        isEOActionInfiniteLiteral
      );

      if (actionLiterals.length > 0 || actionCalls.length > 0) {
        errors.push(
          `[${actionName}]: Transform not supported - calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details`
        );
      }
    }

    return errors;
  }
  return errors;
}

function getDecoratorName(decorator: Decorator): string {
  if (isNode(decorator.expression, 'Identifier')) {
    return decorator.expression.name;
  } else if (
    isNode(decorator.expression, 'CallExpression') &&
    isNode(decorator.expression.callee, 'Identifier')
  ) {
    return decorator.expression.callee.name;
  } else {
    // FIXME: Should we validate this elsewhere and narrow the Decorator type?
    assert(false, 'Unexpected decorator type');
  }
}
