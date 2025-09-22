/*
Expect error:
  ValidationError: Validation errors for class 'Foo8':
    [statefulArray]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

const Foo8 = EmberObject.extend({
  statefulArray: [],
});
