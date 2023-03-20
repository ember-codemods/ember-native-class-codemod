import { inject as controller } from "@ember/controller";
import EmberObject from "@ember/object";

// Do not transform
const Foo11 = EmberObject.extend({
  event: controller()
});