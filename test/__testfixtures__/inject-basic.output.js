import classic from 'ember-classic-decorator';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

@classic
class Foo1 extends EmberObject {
  @service('store')
  b;

  @controller('abc')
  myController;
}
