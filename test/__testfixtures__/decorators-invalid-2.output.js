/*
Expect error:
  ValidationError: Validation errors for class 'Foo2':
    [macroValue]: Transform not supported - call to 'macro' can not be transformed
*/

// Do not transform if not a primitive value
const Foo2 = EmberObject.extend({
  macroValue: macro(),
});