/**
 * Program comments
 */
class Foo extends Test {
  /**
   * Property comments
   */
  prop = "defaultValue";

  boolProp = true;
  numProp = 123;
  [MY_VAL] = "val";

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