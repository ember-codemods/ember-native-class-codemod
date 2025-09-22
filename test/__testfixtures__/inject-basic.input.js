import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

const Foo1 = EmberObject.extend({
  b: service('store'),
  myController: controller('abc'),
});
