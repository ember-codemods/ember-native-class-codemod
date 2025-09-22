import { computed } from '@ember/object';

var HasComputed = EmberObject.extend({
  isEnabled: computed('a', 'c', function() {
    return false;
  }),
  a: true,
  c: ''
});
