/*
Expect error:
  ValidationError: Validation errors for class 'Foo':
    [queryParams]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

import EmberObject from '@ember/object';

// Should not transform
const Foo = EmberObject.extend({
  queryParams: {}
});
