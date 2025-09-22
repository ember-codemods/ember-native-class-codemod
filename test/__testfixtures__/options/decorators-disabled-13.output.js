/*
Expect error:
  ValidationError: Validation errors for class 'Foo13':
    [layout]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";

// Do not transform
const Foo13 = EmberObject.extend({
  layout: "div"
});
