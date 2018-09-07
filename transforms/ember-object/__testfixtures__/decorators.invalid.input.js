// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});
