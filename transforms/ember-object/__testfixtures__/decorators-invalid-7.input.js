// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});