// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});
