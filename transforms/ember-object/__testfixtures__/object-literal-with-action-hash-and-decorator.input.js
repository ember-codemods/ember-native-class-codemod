import EmberObject, { action, set } from '@ember/object';

const Foo = EmberObject.extend({
  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  },

  actions: {
    toggleSnowing() {
      set(this, 'isSnowing', !this.isSnowing);
    }
  }
});
