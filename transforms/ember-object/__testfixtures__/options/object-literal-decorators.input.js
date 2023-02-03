import EmberObject from '@ember/object';

const Foo = EmberObject.extend({
  @userAdded
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  }
});
