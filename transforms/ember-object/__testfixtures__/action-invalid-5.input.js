const Foo5 = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});
