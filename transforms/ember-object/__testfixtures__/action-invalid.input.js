const Foo = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});

const Foo = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});

const Foo = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});

const Foo = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});

const Foo = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});
