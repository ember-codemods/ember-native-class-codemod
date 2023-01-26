import { observer, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";

// Do not transform
const Foo1 = EmberObject.extend({
  computed: computed({
    get() {},
    set() {}
  })
});

// Do not transform
const Foo2 = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform
const Foo3 = EmberObject.extend({
  tagName: "div"
});

// Do not transform
const Foo4 = EmberObject.extend({
  classNames: []
});

// Do not transform
const Foo5 = EmberObject.extend({
  classNameBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo6 = EmberObject.extend({
  attributeBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo7 = EmberObject.extend({
  actions: {
    bar() {}
  }
});

// Do not transform
const Foo8 = EmberObject.extend({
  observer: observer()
});

// Do not transform
const Foo9 = EmberObject.extend({
  event: on()
});

// Do not transform
const Foo10 = EmberObject.extend({
  event: service()
});

// Do not transform
const Foo11 = EmberObject.extend({
  event: controller()
});

// Do not transform if not a primitive value
const Foo12 = EmberObject.extend({
  macroValue: macro()
});

// Do not transform
const Foo13 = EmberObject.extend({
  layout: "div"
});

// Do not transform
const Foo14 = EmberObject.extend({
  @tracked prop: '',
});
