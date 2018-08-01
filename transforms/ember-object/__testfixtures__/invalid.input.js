import { observer, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";

// Do not transform
const Foo = EmberObject.extend({
  computed: computed({
    get() {},
    set() {}
  })
});

// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform
const Foo = EmberObject.extend({
  tagName: "div"
});

// Do not transform
const Foo = EmberObject.extend({
  classNames: []
});

// Do not transform
const Foo = EmberObject.extend({
  classNameBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo = EmberObject.extend({
  attributeBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo = EmberObject.extend({
  actions: {
    bar() {}
  }
});

// Do not transform
const Foo = EmberObject.extend({
  observer: observer()
});

// Do not transform
const Foo = EmberObject.extend({
  event: on()
});

// Do not transform
const Foo = EmberObject.extend({
  event: service()
});

// Do not transform
const Foo = EmberObject.extend({
  event: controller()
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});

// Do not transform as extends Mixin
const Foo = EmberObject.extend(MyMixin, {
  biz: "div"
});

// Do not transform
const Foo = EmberObject.extend({
  layout: "div"
});
