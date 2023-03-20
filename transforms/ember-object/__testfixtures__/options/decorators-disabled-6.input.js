import EmberObject from "@ember/object";

// Do not transform
const Foo6 = EmberObject.extend({
  attributeBindings: ["foo"],
  foo: "val"
});
