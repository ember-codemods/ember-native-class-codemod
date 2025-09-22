import classic from 'ember-classic-decorator';
import EmberObject, { action, set } from '@ember/object';

@classic
class Foo extends EmberObject {
  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  }

  @action
  toggleSnowing() {
    set(this, 'isSnowing', !this.isSnowing);
  }
}
