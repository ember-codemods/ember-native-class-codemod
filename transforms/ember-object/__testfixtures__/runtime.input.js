import Runtime from 'common/runtime';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import { service } from '@ember/service';

/**
 * Program comments
 */
export default Runtime.extend(MyMixin, {
  /**
   * Property comments
   */
  prop: 'defaultValue',
  boolProp: true,
  numProp: 123,
  [MY_VAL]: 'val',
  queryParams: {},

  error: service(),
  errorService: service('error'),

  unobservedProp: null,
  offProp: null,

  numPlusOne: computed('numProp', function() {
    return this.get('numProp') + 1;
  }),

  numPlusPlus: alias('numPlusOne'),

  computedMacro: customMacro(),

  anotherMacro: customMacroWithInput({
    foo: 123,
    bar: 'baz'
  }),

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
    },
  },
});
