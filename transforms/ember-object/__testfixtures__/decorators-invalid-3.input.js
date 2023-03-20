import { computed } from '@ember/object';

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
