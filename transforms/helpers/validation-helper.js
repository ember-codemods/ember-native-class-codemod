const minimatch = require('minimatch');
const { LIFECYCLE_HOOKS, get, getPropName } = require('./util');

const UNSUPPORTED_PROP_NAMES = ['actions', 'layout'];

const TYPE_PATTERNS = {
  service: '**/services/**/*.js',
  services: '**/services/**/*.js',
  controller: '**/controllers/**/*.js',
  controllers: '**/controllers/**/*.js',
  component: '**/components/**/*.js',
  components: '**/components/**/*.js',
  route: '**/routes/**/*.js',
  routes: '**/routes/**/*.js',
};

const TEST_FILE_PATTERN = '**/*-test.js';

/**
 * Returns true if the specified file is a test file
 *
 * @param {String} file file path
 * @returns {Boolean}
 */
function isTestFile(file) {
  return minimatch(file, TEST_FILE_PATTERN);
}

/**
 * Returns true if the given path matches the type of ember object
 * The globa patterns are specified by `TYPE_PATTERNS`
 *
 * @param {String} file file path
 * @param {String} type The type of ember object to check against
 * @returns {Boolean}
 */
function isFileOfType(file, type) {
  if (!type || !TYPE_PATTERNS[type]) {
    return true;
  }
  return minimatch(file, TYPE_PATTERNS[type]);
}

/**
 * Interates through instance properties and verify if it has any prop which can not be transformed
 *
 * @param {Object} { instanceProps } map of object properties
 * @param {Object} { decorators }
 * @returns {Boolean}
 */
function hasValidProps(
  j,
  { instanceProps = [] } = {},
  { decorators = true, classFields = true } = {}
) {
  const unsupportedPropNames = decorators ? [] : UNSUPPORTED_PROP_NAMES;

  return instanceProps.reduce((errors, instanceProp) => {
    if (!classFields && instanceProp.type === 'Literal') {
      errors.push(`[${instanceProp.name}]: Need option '--class-fields=true'`);
    }

    if (
      instanceProp.type === 'ObjectExpression' &&
      !['actions', 'queryParams'].includes(instanceProp.name)
    ) {
      errors.push(
        `[${instanceProp.name}]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects`
      );
    }

    if (instanceProp.isAction) {
      errors = errors.concat(getLifecycleHookErrors(instanceProp));
      errors = errors.concat(getInfiniteLoopErrors(j, instanceProp));
    }

    if (
      (!decorators && (instanceProp.hasDecorators || instanceProp.isClassDecorator)) ||
      unsupportedPropNames.includes(instanceProp.name) ||
      (instanceProp.isCallExpression && !instanceProp.hasDecorators)
    ) {
      errors.push(
        `[${instanceProp.name}]: Transform not supported - need option '--decorators=true' or the property type ${instanceProp.type} can not be transformed`
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
    return errors;
  }, []);
}

/**
 * Iterate over actions and verify that the action name does not match the lifecycle hooks
 * The transformation is not supported if an action has the same name as lifecycle hook
 * Reference: https://github.com/scalvert/ember-es6-class-codemod/issues/34
 *
 * @param {EOProp} actionsProp
 */
function getLifecycleHookErrors(actionsProp) {
  const actionProps = get(actionsProp, 'value.properties');
  return actionProps.reduce((errors, actionProp) => {
    const actionName = getPropName(actionProp);
    if (actionName && LIFECYCLE_HOOKS.includes(actionName)) {
      errors.push(
        `[${actionName}]: Transform not supported - action name matches one of the lifecycle hooks. Rename and try again. See https://github.com/scalvert/ember-es6-class-codemod/issues/34 for more details`
      );
    }
    return errors;
  }, []);
}

/**
 * Returns true if object extends mixin
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {Object} varDeclaration - VariableDeclaration
 * @returns {Boolean}
 */
function isExtendsMixin(j, eoCallExpression) {
  return j(eoCallExpression).get('arguments').value.length > 1;
}

/**
 * Validation against pattern mentioned https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2
 *
 * @param {Object} j - jscodeshift lib reference
 * @param {EOProp} actionsProp
 */
function getInfiniteLoopErrors(j, actionsProp) {
  const actionProps = get(actionsProp, 'value.properties');
  return actionProps.reduce((errors, actionProp) => {
    const actionName = getPropName(actionProp);
    if (actionName) {
      const functExpr = j(actionProp.value);

      // Occurences of this.actionName()
      const actionCalls = functExpr.find(j.CallExpression, {
        callee: {
          type: 'MemberExpression',
          object: {
            type: 'ThisExpression',
          },
          property: {
            type: 'Identifier',
            name: actionName,
          },
        },
      });

      // Occurences of this.get('actionName')() or get(this, 'actionName')()
      const actionLiterals = functExpr.find(j.Literal, { value: actionName });

      if (actionLiterals.length || actionCalls.length) {
        errors.push(
          `[${actionName}]: Transform not supported - calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details`
        );
      }
    }
    return errors;
  }, []);
}

module.exports = { isFileOfType, hasValidProps, isExtendsMixin, isTestFile };
