import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';

// Should succeed
const Foo1 = EmberObject.extend({
  store: service('store'),
});

// Should fail
const Foo2 = EmberObject.extend({
  macroValue: macro(),
})
