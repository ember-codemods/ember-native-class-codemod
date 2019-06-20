import classic from "ember-classic-decorator";

/**
 * Program comments
 */
@classic
class Foo extends Test {
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
