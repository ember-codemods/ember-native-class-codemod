/*
Expect error:
	ValidationError: Validation errors for class 'Foo1':
		[actions]: Transform not supported - [bar]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo1 = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});
