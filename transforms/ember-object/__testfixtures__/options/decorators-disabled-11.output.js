/*
Expect error:
  ValidationError: Validation errors for class 'Foo11':
    [event]: Transform not supported - need option '--decorators=true'
*/

import { inject as controller } from "@ember/controller";
import EmberObject from "@ember/object";

// Do not transform
const Foo11 = EmberObject.extend({
  event: controller()
});