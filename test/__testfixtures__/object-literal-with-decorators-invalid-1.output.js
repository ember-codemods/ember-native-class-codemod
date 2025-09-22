/*
Expect error:
  ValidationError: Validation errors for class 'Foo1':
    [computedMacro]: Transform not supported - can only transform object literal decorators on methods or properties with literal values (string, number, boolean, null, undefined)
    [computedMacro]: Transform not supported - call to 'customMacro' can not be transformed
*/

// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});