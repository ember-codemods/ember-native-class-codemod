import classic from 'ember-classic-decorator';

import {
  classNames,
  attributeBindings,
  classNameBindings,
  tagName,
  layout as templateLayout,
} from '@ember-decorators/component';

import { observes as watcher, on } from '@ember-decorators/object';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

import {
  filter,
  map as computedMap,
  sum as add,
  oneWay as enoWay,
  reads,
  readOnly,
  equal,
  gt,
  alias,
} from '@ember/object/computed';

import { get, set, action, computed } from '@ember/object';
import layout from 'components/templates/foo';
import { someActionUtil } from 'some/action/util';
import NUMERIC_CONSTANT from 'constants/numbers';

@classic
@tagName('div')
@classNames('test-class', 'custom-class')
class Foo1 extends EmberObject {
  a = '';

  @service('store')
  b;

  @controller('abc')
  myController;

  @watcher('xyz')
  observedProp() {
    return 'observed';
  }

  @on('click')
  event() {
    return 'abc';
  }

  @computedMap('chores', function(chore, index) {
    return chore.toUpperCase() + '!';
  })
  excitingChores;

  @filter('chores', function(chore, index, array) {
    return !chore.done;
  })
  remainingChores;

  @action
  someActionUtil() {
    return someActionUtil.call(this, ...arguments);
  }

  /**
  Comments
  */
  @action
  bar(temp1) {}

  @action
  baz() {
    // TODO: This call to super is within an action, and has to refer to the parent
    // class's actions to be safe. This should be refactored to call a normal method
    // on the parent class. If the parent class has not been converted to native
    // classes, it may need to be refactored as well. See
    // https: //github.com/scalvert/ember-native-class-codemod/blob/master/README.md
    // for more details.
    super.actions.baz.call(this, ...arguments);
  }

  @action
  biz() {}
}

@classic
@classNameBindings('isEnabled:enabled:disabled', 'a:b:c', 'c:d')
@attributeBindings('customHref:href')
class comp extends EmberObject {
  @computed('a', 'c')
  get isEnabled() {
    return false;
  }

  a = true;
  c = '';
  customHref = 'http://emberjs.com';
}

@classic
class Foo2 extends EmberObject {
  firstName = null;
  lastName = null;

  /**
  Computed fullname
  */
  @(computed('firstName', 'lastName').readOnly())
  get fullName() {
    return super.fullName && `${this.get('firstName')} ${this.get('lastName')}`;
  }

  set fullName(value) {
    let [firstName, lastName] = value.split(/\s+/);
    this.set('firstName', firstName);
    this.set('lastName', lastName);
    return value;
  }

  /**
  Computed description
  */
  get description() {
    const desc = super.description;
    if (desc) {
      return desc;
    }
    return `${this.get('fullName')}; Age: ${this.get('age')}; Country: ${this.get('country')}`;
  }

  /**
   * Fname
   */
  @alias('firstName')
  fName;

  /**
   * Fname1
   */
  @alias('firstName')
  fName1;

  /**
   * Fname2
   */
  @(computed('firstName', 'lastName').readOnly())
  get fName2() {
    return true;
  }

  /**
   * Fname3
   */
  @(computed('firstName', 'lastName').volatile())
  get fName3() {
    return true;
  }

  /**
   * Lname
   */
  @(alias('firstName', 'lastName').readOnly())
  lName;

  /**
   * Lname1
   */
  @add('description', 'lastName')
  lName1;

  /**
   * Lname2
   */
  @readOnly('description')
  lName2;

  /**
   * Lname3
   */
  @reads('description', 'lastName')
  lName3;

  /**
   * Lname4
   */
  @enoWay('description', 'lastName')
  lName4;

  /**
   * Lname5
   */
  @(add('description', 'lastName').readOnly())
  lName5;

  @(equal('limit', NUMERIC_CONSTANT.LIMIT).readOnly())
  isEqualToLimit;

  @(gt('limit', NUMERIC_CONSTANT).readOnly())
  isGreaterThanLimit;
}

@classic
@templateLayout(layout)
class Foo3 extends EmberObject {}
