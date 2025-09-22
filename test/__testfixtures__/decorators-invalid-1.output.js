/*
Expect error:
  ValidationError: Validation errors for class 'Foo1':
    [statefulObject]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

// Do not transform
const Foo1 = EmberObject.extend({
  statefulObject: {},
});
