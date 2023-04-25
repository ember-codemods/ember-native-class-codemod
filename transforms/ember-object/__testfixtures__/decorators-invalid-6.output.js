/*
Expect error:
  ValidationError: Validation errors for class 'Foo6':
    [fName2]: Transform not supported - value has modifiers like 'property' or 'meta'
*/

import { computed } from '@ember/object';

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});