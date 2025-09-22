import EmberObject from "@ember/object";
import { inject as service } from "@ember/service";

// Do not transform
const Foo10 = EmberObject.extend({
  event: service()
});