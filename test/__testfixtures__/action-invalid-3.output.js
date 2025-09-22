/*
Expect error:
	ValidationError: Validation errors for class 'Foo3':
		[actions]: Transform not supported - [baz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});
