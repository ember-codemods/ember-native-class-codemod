import EmberObject from "@ember/object";

// Do not transform
const Foo5 = EmberObject.extend({
  classNameBindings: ["foo"],
  foo: "val"
});
