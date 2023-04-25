/*
Expect error:
  ValidationError: Validation errors for class 'Foo7':
    [actions]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";

// Do not transform
const Foo7 = EmberObject.extend({
  actions: {
    bar() {}
  }
});
