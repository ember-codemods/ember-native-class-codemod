import { computed } from '@ember/object';

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});