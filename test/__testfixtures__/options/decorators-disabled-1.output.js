/*
Expect error:
  ValidationError: Validation errors for class 'Foo1':
    [computed]: Transform not supported - need option '--decorators=true'
*/

import EmberObject, { computed } from "@ember/object";

// Do not transform
const Foo1 = EmberObject.extend({
  computed: computed({
    get() {},
    set() {}
  })
});
