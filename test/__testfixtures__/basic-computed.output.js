import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';

@classic
class HasComputed extends EmberObject {
  @computed('a', 'c')
  get isEnabled() {
    return false;
  }

  a = true;
  c = '';
}
