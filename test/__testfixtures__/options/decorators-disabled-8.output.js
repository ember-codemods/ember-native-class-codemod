/*
Expect error:
  ValidationError: Validation errors for class 'Foo8':
    [observer]: Transform not supported - need option '--decorators=true'
*/

import EmberObject,{ observer } from "@ember/object";

// Do not transform
const Foo8 = EmberObject.extend({
  observer: observer()
});