/*
Expect error:
  ValidationError: Validation errors for class 'Foo6':
    [attributeBindings]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";

// Do not transform
const Foo6 = EmberObject.extend({
  attributeBindings: ["foo"],
  foo: "val"
});