import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';

// Should succeed
@classic
class Foo1 extends EmberObject {
  @service('store')
  store;
}

// Should fail
const Foo2 = EmberObject.extend({
  macroValue: macro(),
})
