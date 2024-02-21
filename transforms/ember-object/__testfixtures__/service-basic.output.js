import classic from 'ember-classic-decorator';
import { service } from '@ember/service';

@classic
class Foo1 extends EmberObject {
  @service('store')
  b;
}
