/*
Expect error:
  ValidationError: Validation errors for class 'Foo5':
    [fName2]: Transform not supported - value has modifiers like 'property' or 'meta'
*/

import { computed } from '@ember/object';

// Do not transform as computed prop has `property`
const Foo5 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).property('baz'),
});