/*
Expect error:
  ValidationError: Validation errors for class 'Foo3':
    [tagName]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";

// Do not transform
const Foo3 = EmberObject.extend({
  tagName: "div"
});
