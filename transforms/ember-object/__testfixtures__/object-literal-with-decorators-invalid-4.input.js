// Do not transform function expression if not on allowlist
const Foo4 = EmberObject.extend({
  @userAdded methodish: () => {},
});
