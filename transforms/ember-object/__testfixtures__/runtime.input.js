import RuntimeInput from "common/runtime/input";
import { alias } from "@ember/object/computed";
import { computed } from "@ember/object";

/**
 * Program comments
 */
export default RuntimeInput.extend(MyMixin, {
  /**
   * Property comments
   */
  prop: "defaultValue",
  boolProp: true,
  numProp: 123,
  [MY_VAL]: "val",
  queryParams: {},

  unobservedProp: null,
  offProp: null,

  numPlusOne: computed("numProp", function() {
    return this.get("numProp") + 1;
  }),

  numPlusPlus: alias("numPlusOne"),

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

  overriddenMethod() {
    this._super(...arguments);
  },

  actions: {
    actionMethod() {
      this._super(...arguments) && this.boolProp;
    },

    overriddenActionMethod() {
      this._super(...arguments) && this.boolProp;
    }
  }
});
