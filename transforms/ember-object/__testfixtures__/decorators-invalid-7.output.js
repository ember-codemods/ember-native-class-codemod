/*
Expect error:
  ValidationError: Validation errors for class 'Foo7':
    [actions]: Transform not supported - [click]: action name matches one of the lifecycle hooks. Rename and try again. See https://github.com/scalvert/ember-native-class-codemod/issues/34 for more details
*/

// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});
