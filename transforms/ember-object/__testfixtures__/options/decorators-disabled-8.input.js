import EmberObject,{ observer } from "@ember/object";

// Do not transform
const Foo8 = EmberObject.extend({
  observer: observer()
});