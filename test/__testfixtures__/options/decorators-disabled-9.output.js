/*
Expect error:
  ValidationError: Validation errors for class 'Foo9':
    [event]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";
import { on } from "@ember/object/evented";

// Do not transform
const Foo9 = EmberObject.extend({
  event: on()
});