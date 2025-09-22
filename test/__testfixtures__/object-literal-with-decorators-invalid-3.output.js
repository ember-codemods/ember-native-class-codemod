/*
Expect error:
  ValidationError: Validation errors for class 'Foo3':
    [arr]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

// Do not transform array
const Foo3 = EmberObject.extend({
  @tracked arr: [1, 2, 3],
});