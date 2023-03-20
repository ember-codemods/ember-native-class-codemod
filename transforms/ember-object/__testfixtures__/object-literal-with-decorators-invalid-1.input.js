// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});