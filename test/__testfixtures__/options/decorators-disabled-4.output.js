/*
Expect error:
  ValidationError: Validation errors for class 'Foo4':
    [classNames]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object"

// Do not transform
const Foo4 = EmberObject.extend({
  classNames: []
});