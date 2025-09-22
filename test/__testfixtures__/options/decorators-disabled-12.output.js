/*
Expect error:
  ValidationError: Validation errors for class 'Foo12':
    [macroValue]: Transform not supported - need option '--decorators=true'
    [macroValue]: Transform not supported - call to 'macro' can not be transformed
*/

import EmberObject from "@ember/object";

// Do not transform if not a primitive value
const Foo12 = EmberObject.extend({
  macroValue: macro()
});
