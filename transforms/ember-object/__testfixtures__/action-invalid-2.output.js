/*
Expect error:
	ValidationError: Validation errors for class 'Foo2':
		[actions]: Transform not supported - [biz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo2 = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});
