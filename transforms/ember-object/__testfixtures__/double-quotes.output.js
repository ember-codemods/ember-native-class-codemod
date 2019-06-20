import classic from "ember-classic-decorator";

/**
 * Program comments
 */
@classic
class Foo extends Test.extend(MyMixin) {
  /**
   * Property comments
   */
  prop = "defaultValue";

  boolProp = true;
  numProp = 123;
  [MY_VAL] = "val";
  queryParams = {};
  someVal = someVal;

  /**
   * Method comments
   */
  method() {
    // do things
  }

  otherMethod() {}

  get accessor() {
    return this._value;
  }

  set accessor(value) {
    this._value = value;
  }

  anotherMethod() {
    super.anotherMethod(...arguments);
  }
}

@classic
class Foo extends EmberObject.extend(MixinA, MixinB) {}
