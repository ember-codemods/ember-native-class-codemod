/*
Expect error:
  ValidationError: Validation errors for class 'Foo4':
    [lName1]: Transform not supported - call to 'add' can not be transformed
*/

// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});