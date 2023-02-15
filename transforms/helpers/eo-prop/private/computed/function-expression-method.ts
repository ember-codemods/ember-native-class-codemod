import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import { replaceMethodSuperExpressions } from '../../../transform-helper';
import { assert } from '../../../util/types';
import AbstractEOComputedProp from './abstract';

/**
 * Ember Object Computed Function Expression Property
 *
 * A wrapper object for Ember Object properties where the value is a
 * `CallExpression` with a `FunctionExpression` as its last argument.
 *
 * These represent computed properties (including computed macros) to be
 * transformed into `ClassMethod`s with their appropriate decorators (and any
 * modifiers).
 *
 * @example
 *
 * ```
 * import { observer as watcher } from '@ember/object';
 *
 * const MyObject = EmberObject.extend({
 *   observedProp: watcher('xyz', function() {
 *     return 'observed';
 *   }),
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * import { observes as watcher } from '@ember-decorators/object';
 *
 * class MyObject extends EmberObject {
 *   @watcher('xyz')
 *   observedProp() {
 *     return 'observed';
 *   }
 * }
 * ```
 *
 * Notably, if the modifiers `volatile` and `readOnly` are used in conjunction,
 * a non-computed getter will be returned.
 */
export default class EOComputedFunctionExpressionMethod extends AbstractEOComputedProp<AST.ClassMethod> {
  build(): AST.ClassMethod {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'FunctionExpression',
      'expected lastArg to be a FunctionExpression'
    );
    return replaceMethodSuperExpressions(
      j.classMethod.from({
        kind: 'method',
        key: this.key,
        params: lastArg.params,
        body: lastArg.body,
        comments: this.comments,
        decorators: this.buildDecorators(),
      }),
      this.replaceSuperWithUndefined
    );
  }
}
