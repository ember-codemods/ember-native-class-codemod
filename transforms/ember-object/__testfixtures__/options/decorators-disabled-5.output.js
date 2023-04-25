/*
Expect error:
  ValidationError: Validation errors for class 'Foo5':
    [classNameBindings]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";

// Do not transform
const Foo5 = EmberObject.extend({
  classNameBindings: ["foo"],
  foo: "val"
});
