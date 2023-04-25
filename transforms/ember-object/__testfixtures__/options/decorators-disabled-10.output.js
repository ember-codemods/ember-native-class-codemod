/*
Expect error:
  ValidationError: Validation errors for class 'Foo10':
    [event]: Transform not supported - need option '--decorators=true'
*/

import EmberObject from "@ember/object";
import { inject as service } from "@ember/service";

// Do not transform
const Foo10 = EmberObject.extend({
  event: service()
});