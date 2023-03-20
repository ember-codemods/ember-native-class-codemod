/*
Expect error:
	ValidationError: Validation errors for class 'Foo2':
		[prop]: Transform not supported - need option '--class-fields=true'
		[boolProp]: Transform not supported - need option '--class-fields=true'
		[numProp]: Transform not supported - need option '--class-fields=true'
		[MY_VAL]: Transform not supported - need option '--class-fields=true'
*/

const Foo1 = EmberObject.extend({});

/**
 * Program comments
 */
const Foo2 = Test.extend({
  /**
   * Property comments
   */
  prop: "defaultValue",
  boolProp: true,
  numProp: 123,
  [MY_VAL]: "val",

  /**
   * Method comments
   */
  method() {
    // do things
  },

  otherMethod: function() {},

  get accessor() {
    return this._value;
  },

  set accessor(value) {
    this._value = value;
  },

  anotherMethod() {
    this._super(...arguments);
  }
});
