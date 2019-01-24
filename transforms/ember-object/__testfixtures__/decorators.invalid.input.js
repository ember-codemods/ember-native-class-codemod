// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});

// Do not transform as a computed property has readOnly and volatile with meta
const Foo = EmberObject.extend({
  firstName: "",
  lastName: "",

  fName2: computed("firstName", "lastName", function() {
    return true;
  })
    .property("baz")
    .readOnly()
    .volatile()
    .meta({ type: "Property" })
});

// Do not transform as a computed meta has volatile
const Foo = EmberObject.extend({
  lName1: add("description", "lastName").volatile()
});

// Do not transform as computed prop has `property`
const Foo = EmberObject.extend({
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).property("baz")
});

// Do not transform as computed prop has `meta`
const Foo = EmberObject.extend({
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).meta({ type: "Property" })
});

// Do not transform as action name matches lifecycle hook
const Foo = EmberObject.extend({
  actions: {
    click() {
      this.set("clicked", true);
    }
  }
});
