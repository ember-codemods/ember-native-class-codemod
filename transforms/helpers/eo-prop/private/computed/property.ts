import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import AbstractEOComputedProp from './abstract';

/**
 * Ember Object Computed Property
 *
 * A wrapper object for Ember Object properties not captured by
 * `EOFunctionExpressionProp` or `EOComputedObjectExpressionProp`.
 *
 * These represent computed properties (including computed macros) to be
 * transformed into `ClassProperty`s with their appropriate decorators
 * (and any modifiers).
 *
 * @example
 *
 * ```
 * const MyObject = EmberObject.extend({
 *   firstName: 'Krystan',  // EOSimpleProp
 *   lastName: 'HuffMenne', // EOSimpleProp
 *
 *   fName1: alias('firstName'),
 *
 *   fName2: alias('firstName').readOnly(),
 *
 *   computedMacro: customMacro()
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
 *   \@alias('firstName')
 *   fName1;
 *
 *   \@(alias('firstName').readOnly())
 *   fName2;
 *
 *   \@customMacro()
 *   computedMacro;
 * }
 * ```
 */
export default class EOComputedProp extends AbstractEOComputedProp<AST.ClassProperty> {
  build(): AST.ClassProperty {
    const classProp = j.classProperty.from({
      key: this.key,
      // TODO: This how we can remove the `= undefined` value;
      value: this.hasDecorators ? null : this.value,
      comments: this.comments,
      computed: this.rawProp.computed ?? false,
    });

    // @ts-expect-error jscodeshift AST types are incorrect
    // If this ever gets fixed, check if the builder `.from` method above
    // will now take a decorators param.
    classProp.decorators = this.buildDecorators();

    return classProp;
  }
}
