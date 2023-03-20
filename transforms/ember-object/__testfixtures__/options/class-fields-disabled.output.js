/*
Expect error:
  ValidationError: Validation errors for class 'Foo':
    [prop]: Transform not supported - need option '--class-fields=true'
    [boolProp]: Transform not supported - need option '--class-fields=true'
    [numProp]: Transform not supported - need option '--class-fields=true'
    [MY_VAL]: Transform not supported - need option '--class-fields=true'
*/

/**
 * Program comments
 */
const Foo = Test.extend({
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
