import classic from 'ember-classic-decorator';
import EmberObject from '@ember/object';

@classic
class Foo extends EmberObject {
  @userAdded
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  }
}