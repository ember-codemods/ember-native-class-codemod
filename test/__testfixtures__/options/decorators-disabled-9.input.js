import EmberObject from "@ember/object";
import { on } from "@ember/object/evented";

// Do not transform
const Foo9 = EmberObject.extend({
  event: on()
});