import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import { replaceGetterSetterSuperExpressions } from '../../../transform-helper';
import { assert, defined } from '../../../util/types';
import AbstractEOComputedProp from './abstract';

/**
 * Ember Object Computed Function Expression Property
 *
 * A wrapper object for Ember Object properties where the value is a
 * `CallExpression` with a `FunctionExpression` as its last argument.
 *
 * These represent computed properties (including computed macros) to be
 * transformed into `ClassMethod` getters with their appropriate decorators
 * (and any modifiers).
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   firstName: 'Krystan',  // EOSimpleProp
 *   lastName: 'HuffMenne', // EOSimpleProp
 *
 *   fullName1: computed('firstName', 'lastName', function() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }),
 *
 *   fullName2: computed('firstName', 'lastName', function() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }).volatile(),
 *
 *   fullName3: computed('firstName', 'lastName', function() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }).volatile().readOnly(),
 * });
 * ```
 *
 * transforms into:
 *
 * ```
 * class MyObject extends EmberObject {
 *   firstName = 'Krystan';  // EOSimpleProp
 *   lastName = 'HuffMenne'; // EOSimpleProp
 *
 *   \@computed('firstName', 'lastName')
 *   get fullName2() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }
 *
 *   \@(computed('firstName', 'lastName').volatile())
 *   get fullName2() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }
 *
 *   get fullName3() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }
 * }
 * ```
 *
 * Notably, if the modifiers `volatile` and `readOnly` are used in conjunction,
 * a non-computed getter will be returned.
 */
export default class EOComputedFunctionExpressionProp extends AbstractEOComputedProp<AST.ClassMethod> {
  build(): AST.ClassMethod {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'FunctionExpression',
      'expected lastArg to be a FunctionExpression'
    );
    // FIXME: Is this correct? Maybe should handle kind === 'method' with replaceMethodSuperExpression ??
    return replaceGetterSetterSuperExpressions(
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
