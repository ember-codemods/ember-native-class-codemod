// Do not transform
const Foo1 = EmberObject.extend({
  statefulObject: {},
  statefulArray: [],
});

// Do not transform if not a primitive value
const Foo2 = EmberObject.extend({
  macroValue: macro(),
});

// Do not transform as a computed property has readOnly and volatile with meta
const Foo3 = EmberObject.extend({
  firstName: '',
  lastName: '',

  fName2: computed('firstName', 'lastName', function() {
    return true;
  })
    .property('baz')
    .readOnly()
    .volatile()
    .meta({ type: 'Property' }),
});

// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});

// Do not transform as computed prop has `property`
const Foo5 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).property('baz'),
});

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});

// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});
