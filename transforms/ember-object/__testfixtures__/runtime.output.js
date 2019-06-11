import { off, unobserves } from "@ember-decorators/object";
import { action, computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import RuntimeInput from "common/runtime/input";

/**
 * Program comments
 */
export default class RuntimeInputEmberObject extends RuntimeInput.extend(MyMixin) {
  /**
   * Property comments
   */
  prop = "defaultValue";

  boolProp = true;
  numProp = 123;
  [MY_VAL] = "val";
  queryParams = {};

  @unobserves("prop3", "prop4")
  unobservedProp;

  @off("prop1", "prop2")
  offProp;

  @computed("numProp")
  get numPlusOne() {
    return this.get("numProp") + 1;
  }

  @alias("numPlusOne")
  numPlusPlus;

  @customMacro
  computedMacro;

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
    undefined;
  }

  overriddenMethod() {
    super.overriddenMethod(...arguments);
  }

  @action
  actionMethod() {
    undefined && this.boolProp;
  }

  @action
  overriddenActionMethod() {
    // TODO: This call to super is within an action, and has to refer to the parent
    // class's actions to be safe. This should be refactored to call a normal method
    // on the parent class. If the parent class has not been converted to native
    // classes, it may need to be refactored as well. See
    // https: //github.com/scalvert/ember-es6-class-codemod/blob/master/README.md
    // for more details.
    super.actions.overriddenActionMethod.call(this, ...arguments) && this.boolProp;
  }
}
