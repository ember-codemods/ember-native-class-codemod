const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});
