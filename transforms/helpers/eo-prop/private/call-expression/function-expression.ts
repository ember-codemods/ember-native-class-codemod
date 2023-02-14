import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import { replaceComputedSuperExpressions as replaceComputedSuperExpression } from '../../../transform-helper';
import { assert, defined } from '../../../util/types';
import AbstractEOCallExpressionProp from './abstract';

/**
 * Ember Object Computed Function Expression Property
 *
 * A wrapper object for Ember Object properties with `FunctionExpression` values
 * for computed properties (including computed macros) to be transformed into
 * `ClassMethod`s with their appropriate decorators (and any modifiers).
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   firstName: 'Krystan',
 *   lastName: 'HuffMenne',
 *   fName1: alias('firstName'),
 *   fName2: alias('firstName').readOnly(),
 *   fullName: computed('firstName', 'lastName', function() {
 *     return `${firstName} ${lastName}`;
 *   }),
 *   // FIXME: Getter/setter version
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * class MyObject extends EmberObject {
 *   FIXME: Fill in
 * }
 * ```
 *
 * @see EOMethod
 */
export default class EOComputedFunctionExpressionProp extends AbstractEOCallExpressionProp<AST.ClassMethod> {
  build(): AST.ClassMethod {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'FunctionExpression',
      'expected lastArg to be a FunctionExpression'
    );
    return replaceComputedSuperExpression(
      j.classMethod.from({
        kind: defined(this.kind),
        key: this.key,
        params: lastArg.params,
        body: lastArg.body,
        comments: this.comments,
        decorators: this.buildDecorators(),
      }),
      this.replaceSuperWithUndefined,
      this.key
    );
  }
}
