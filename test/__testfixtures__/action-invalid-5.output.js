/*
Expect error:
	ValidationError: Validation errors for class 'Foo5':
		[actions]: Transform not supported - [thisBaz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo5 = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});
