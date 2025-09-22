/*
Expect error:
	ValidationError: Validation errors for class 'Foo4':
		[actions]: Transform not supported - [sendBaz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo4 = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});
