import { default as j } from 'jscodeshift';
import * as AST from '../../../ast';
import { replaceGetterSetterSuperExpressions } from '../../../transform-helper';
import { assert, defined } from '../../../util/types';
import AbstractEOComputedProp from './abstract';

/**
 * Ember Object Computed Object Expression Property
 *
 * A wrapper object for Ember Object properties where the value is a
 * `CallExpression` with an `ObjectExpression` as its last argument.
 *
 * These represent computed properties (including computed macros) to be
 * transformed into `ClassMethod` getters and/or setters with their appropriate
 * decorators (and any modifiers).
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   firstName: 'Krystan',  // EOSimpleProp
 *   lastName: 'HuffMenne', // EOSimpleProp
 *
 *   fullName: computed('firstName', 'lastName', {
 *     get(key) {
 *       return `${this.get('firstName')} ${this.get('lastName')}`;
 *     },
 *     set(key, value) {
 *       //...
 *     }
 *   })
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
 *   get fullName() {
 *     return `${this.get('firstName')} ${this.get('lastName')}`;
 *   }
 *
 *   set fullName() {
 *     // ...
 *   }
 * }
 * ```
 */
export default class EOComputedObjectExpressionProp extends AbstractEOComputedProp<
  AST.ClassMethod[]
> {
  build(): AST.ClassMethod[] {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'ObjectExpression',
      'expected lastArg to be a ObjectExpression'
    );
    const classMethods = lastArg.properties.map((property) => {
      assert(AST.isEOMethod(property), 'expected EOMethod');
      assert(
        (['get', 'set'] as const).includes(property.key.name as 'get' | 'set')
      );
      const kind = property.key.name as 'get' | 'set';
      const key = this.key;

      const params = [...property.params];
      params.shift();

      return replaceGetterSetterSuperExpressions(
        j.classMethod.from({
          kind,
          key,
          params,
          body: property.body,
          comments: property.comments ?? null,
        }),
        this.replaceSuperWithUndefined,
        this.key
      );
    });

    const firstMethod = defined(classMethods[0]);
    firstMethod.comments = [
      ...(firstMethod.comments ?? []),
      ...(this.comments ?? []),
    ];
    firstMethod.decorators = this.buildDecorators();

    return classMethods;
  }
}
