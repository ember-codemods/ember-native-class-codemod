/**
 * Program comments
 */
const Foo1 = Test.extend(MyMixin, {
  /**
   * Property comments
   */
  prop: "defaultValue",
  boolProp: true,
  numProp: 123,
  [MY_VAL]: "val",
  queryParams: {},
  someVal,

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
  },
});

const Foo2 = EmberObject.extend(MixinA, MixinB);
