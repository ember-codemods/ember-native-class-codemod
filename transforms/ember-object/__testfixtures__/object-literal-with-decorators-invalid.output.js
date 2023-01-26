// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  @tracked macroValue: macro(),
});
