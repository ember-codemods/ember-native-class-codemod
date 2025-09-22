import EmberObject, { computed } from "@ember/object";

// Do not transform
const Foo1 = EmberObject.extend({
  computed: computed({
    get() {},
    set() {}
  })
});
