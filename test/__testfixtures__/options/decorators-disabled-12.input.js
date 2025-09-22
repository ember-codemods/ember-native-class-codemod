import EmberObject from "@ember/object";

// Do not transform if not a primitive value
const Foo12 = EmberObject.extend({
  macroValue: macro()
});
