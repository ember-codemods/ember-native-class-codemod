import { service } from '@ember/service';

const Foo1 = EmberObject.extend({
  b: service('store'),
});
