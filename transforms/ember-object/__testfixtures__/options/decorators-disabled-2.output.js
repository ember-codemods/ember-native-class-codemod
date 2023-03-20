/*
Expect error:
  ValidationError: Validation errors for class 'Foo2':
    [prop]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";

// Do not transform
const Foo2 = EmberObject.extend({
  @tracked prop: '',
});
