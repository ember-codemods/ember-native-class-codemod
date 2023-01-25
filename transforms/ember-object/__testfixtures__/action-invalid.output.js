const Foo1 = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});

const Foo2 = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});

const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});

const Foo4 = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});

const Foo5 = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});
