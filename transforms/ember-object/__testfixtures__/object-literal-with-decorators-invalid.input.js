// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});

// Do not transform if not on allowlist
const Foo2 = EmberObject.extend({
  @banned prop: '',
});

// Do not transform array
const Foo3 = EmberObject.extend({
  @tracked arr: [1, 2, 3],
});

// Do not function expression if not on allowlist
const Foo4 = EmberObject.extend({
  @userAdded methodish: () => {},
});
