/**
 * Program comments
 */
class Foo extends Test.extend(MyMixin) {
  /**
   * Property comments
   */
  prop = "defaultValue";

  boolProp = true;
  numProp = 123;
  [MY_VAL] = "val";
  queryParams = {};

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
    if (super.anotherMethod) {
      super.anotherMethod(...arguments);
    }
  }
}

class Foo extends EmberObject.extend(MixinA, MixinB) {}
