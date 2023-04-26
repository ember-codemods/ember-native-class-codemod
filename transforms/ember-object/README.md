# ember-object

## Usage

```
npx ember-native-class-codemod ember-object path/of/files/ or/some**/*glob.js

# or

yarn global add ember-native-class-codemod
ember-native-class-codemod ember-object path/of/files/ or/some**/*glob.js
```

## Input / Output

<!--FIXTURES_TOC_START-->
* [action-invalid-1](#action-invalid-1)
* [action-invalid-2](#action-invalid-2)
* [action-invalid-3](#action-invalid-3)
* [action-invalid-4](#action-invalid-4)
* [action-invalid-5](#action-invalid-5)
* [async-function-property](#async-function-property)
* [async-method](#async-method)
* [basic-computed](#basic-computed)
* [basic](#basic)
* [chained-class-definition](#chained-class-definition)
* [class-fields](#class-fields)
* [class-reopen](#class-reopen)
* [decorators-invalid-1](#decorators-invalid-1)
* [decorators-invalid-2](#decorators-invalid-2)
* [decorators-invalid-3](#decorators-invalid-3)
* [decorators-invalid-4](#decorators-invalid-4)
* [decorators-invalid-5](#decorators-invalid-5)
* [decorators-invalid-6](#decorators-invalid-6)
* [decorators-invalid-7](#decorators-invalid-7)
* [decorators-invalid-8](#decorators-invalid-8)
* [decorators](#decorators)
* [default-export](#default-export)
* [double-quotes](#double-quotes)
* [ember-concurrency](#ember-concurrency)
* [frozen](#frozen)
* [generator-method](#generator-method)
* [generator-property](#generator-property)
* [import](#import)
* [injecting-service](#injecting-service)
* [logical-expression](#logical-expression)
* [mixin](#mixin)
* [object-literal-with-action-hash-and-decorator](#object-literal-with-action-hash-and-decorator)
* [object-literal-with-decorators-invalid-1](#object-literal-with-decorators-invalid-1)
* [object-literal-with-decorators-invalid-2](#object-literal-with-decorators-invalid-2)
* [object-literal-with-decorators-invalid-3](#object-literal-with-decorators-invalid-3)
* [object-literal-with-decorators-invalid-4](#object-literal-with-decorators-invalid-4)
* [object-literal-with-decorators](#object-literal-with-decorators)
* [runtime](#runtime)
<!--FIXTURES_TOC_END-->

## <!--FIXTURES_CONTENT_START-->
---
<a id="action-invalid-1">**action-invalid-1**</a>

**Input** (<small>[action-invalid-1.input.js](transforms/ember-object/__testfixtures__/action-invalid-1.input.js)</small>):
```js
const Foo1 = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});
```

**Output** (<small>[action-invalid-1.output.js](transforms/ember-object/__testfixtures__/action-invalid-1.output.js)</small>):
```js
/*
Expect error:
	ValidationError: Validation errors for class 'Foo1':
		[actions]: Transform not supported - [bar]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo1 = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});

```
---
<a id="action-invalid-2">**action-invalid-2**</a>

**Input** (<small>[action-invalid-2.input.js](transforms/ember-object/__testfixtures__/action-invalid-2.input.js)</small>):
```js
const Foo2 = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});

```

**Output** (<small>[action-invalid-2.output.js](transforms/ember-object/__testfixtures__/action-invalid-2.output.js)</small>):
```js
/*
Expect error:
	ValidationError: Validation errors for class 'Foo2':
		[actions]: Transform not supported - [biz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo2 = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});

```
---
<a id="action-invalid-3">**action-invalid-3**</a>

**Input** (<small>[action-invalid-3.input.js](transforms/ember-object/__testfixtures__/action-invalid-3.input.js)</small>):
```js
const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});

```

**Output** (<small>[action-invalid-3.output.js](transforms/ember-object/__testfixtures__/action-invalid-3.output.js)</small>):
```js
/*
Expect error:
	ValidationError: Validation errors for class 'Foo3':
		[actions]: Transform not supported - [baz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});

```
---
<a id="action-invalid-4">**action-invalid-4**</a>

**Input** (<small>[action-invalid-4.input.js](transforms/ember-object/__testfixtures__/action-invalid-4.input.js)</small>):
```js
const Foo4 = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});
```

**Output** (<small>[action-invalid-4.output.js](transforms/ember-object/__testfixtures__/action-invalid-4.output.js)</small>):
```js
/*
Expect error:
	ValidationError: Validation errors for class 'Foo4':
		[actions]: Transform not supported - [sendBaz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo4 = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});

```
---
<a id="action-invalid-5">**action-invalid-5**</a>

**Input** (<small>[action-invalid-5.input.js](transforms/ember-object/__testfixtures__/action-invalid-5.input.js)</small>):
```js
const Foo5 = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});

```

**Output** (<small>[action-invalid-5.output.js](transforms/ember-object/__testfixtures__/action-invalid-5.output.js)</small>):
```js
/*
Expect error:
	ValidationError: Validation errors for class 'Foo5':
		[actions]: Transform not supported - [thisBaz]: calling the passed action would cause an infinite loop. See https://github.com/scalvert/eslint-plugin-ember-es6-class/pull/2 for more details
*/

const Foo5 = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});

```
---
<a id="async-function-property">**async-function-property**</a>

**Input** (<small>[async-function-property.input.js](transforms/ember-object/__testfixtures__/async-function-property.input.js)</small>):
```js
const Foo = Test.extend({
  myAsyncMethod: async function() {
    await Promise.resolve('hello');
  }
});

```

**Output** (<small>[async-function-property.output.js](transforms/ember-object/__testfixtures__/async-function-property.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

@classic
class Foo extends Test {
  async myAsyncMethod() {
    await Promise.resolve('hello');
  }
}

```
---
<a id="async-method">**async-method**</a>

**Input** (<small>[async-method.input.js](transforms/ember-object/__testfixtures__/async-method.input.js)</small>):
```js
const Foo = Test.extend({
  async myAsyncMethod() {
    await Promise.resolve('hello');
  }
});

```

**Output** (<small>[async-method.output.js](transforms/ember-object/__testfixtures__/async-method.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

@classic
class Foo extends Test {
  async myAsyncMethod() {
    await Promise.resolve('hello');
  }
}

```
---
<a id="basic-computed">**basic-computed**</a>

**Input** (<small>[basic-computed.input.js](transforms/ember-object/__testfixtures__/basic-computed.input.js)</small>):
```js
import { computed } from '@ember/object';

var HasComputed = EmberObject.extend({
  isEnabled: computed('a', 'c', function() {
    return false;
  }),
  a: true,
  c: ''
});

```

**Output** (<small>[basic-computed.output.js](transforms/ember-object/__testfixtures__/basic-computed.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';

@classic
class HasComputed extends EmberObject {
  @computed('a', 'c')
  get isEnabled() {
    return false;
  }

  a = true;
  c = '';
}

```
---
<a id="basic">**basic**</a>

**Input** (<small>[basic.input.js](transforms/ember-object/__testfixtures__/basic.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo1 = Test.extend(MyMixin, {
  /**
   * Property comments
   */
  prop: 'defaultValue',
  boolProp: true,
  numProp: 123,
  [MY_VAL]: 'val',
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

```

**Output** (<small>[basic.output.js](transforms/ember-object/__testfixtures__/basic.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

/**
 * Program comments
 */
@classic
class Foo1 extends Test.extend(MyMixin) {
  /**
   * Property comments
   */
  prop = 'defaultValue';

  boolProp = true;
  numProp = 123;
  [MY_VAL] = 'val';
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
class Foo2 extends EmberObject.extend(MixinA, MixinB) {}

```
---
<a id="chained-class-definition">**chained-class-definition**</a>

**Input** (<small>[chained-class-definition.input.js](transforms/ember-object/__testfixtures__/chained-class-definition.input.js)</small>):
```js
import EmberObject from '@ember/object';

export default EmberObject.extend({}).reopenClass({});

```

**Output** (<small>[chained-class-definition.output.js](transforms/ember-object/__testfixtures__/chained-class-definition.output.js)</small>):
```js
/*
Expect error:
	ValidationError: Validation errors for class 'ChainedClassDefinition':
		class has chained definition (e.g. EmberObject.extend().reopenClass();
*/

import EmberObject from '@ember/object';

export default EmberObject.extend({}).reopenClass({});

```
---
<a id="class-fields">**class-fields**</a>

**Input** (<small>[class-fields.input.js](transforms/ember-object/__testfixtures__/class-fields.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend({
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

```

**Output** (<small>[class-fields.output.js](transforms/ember-object/__testfixtures__/class-fields.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

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

```
---
<a id="class-reopen">**class-reopen**</a>

**Input** (<small>[class-reopen.input.js](transforms/ember-object/__testfixtures__/class-reopen.input.js)</small>):
```js
import EmberObject from '@ember/object';

const Foo = EmberObject.extend({});

Foo.reopenClass({});

export default Foo;

```

**Output** (<small>[class-reopen.output.js](transforms/ember-object/__testfixtures__/class-reopen.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import EmberObject from '@ember/object';

@classic
class Foo extends EmberObject {}

Foo.reopenClass({});

export default Foo;

```
---
<a id="decorators-invalid-1">**decorators-invalid-1**</a>

**Input** (<small>[decorators-invalid-1.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-1.input.js)</small>):
```js
// Do not transform
const Foo1 = EmberObject.extend({
  statefulObject: {},
});

```

**Output** (<small>[decorators-invalid-1.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-1.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo1':
    [statefulObject]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

// Do not transform
const Foo1 = EmberObject.extend({
  statefulObject: {},
});

```
---
<a id="decorators-invalid-2">**decorators-invalid-2**</a>

**Input** (<small>[decorators-invalid-2.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-2.input.js)</small>):
```js
// Do not transform if not a primitive value
const Foo2 = EmberObject.extend({
  macroValue: macro(),
});
```

**Output** (<small>[decorators-invalid-2.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-2.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo2':
    [macroValue]: Transform not supported - call to 'macro' can not be transformed
*/

// Do not transform if not a primitive value
const Foo2 = EmberObject.extend({
  macroValue: macro(),
});
```
---
<a id="decorators-invalid-3">**decorators-invalid-3**</a>

**Input** (<small>[decorators-invalid-3.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-3.input.js)</small>):
```js
import { computed } from '@ember/object';

// Do not transform as a computed property has readOnly and volatile with meta
const Foo3 = EmberObject.extend({
  firstName: '',
  lastName: '',

  fName2: computed('firstName', 'lastName', function() {
    return true;
  })
    .property('baz')
    .readOnly()
    .volatile()
    .meta({ type: 'Property' }),
});

```

**Output** (<small>[decorators-invalid-3.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-3.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo3':
    [fName2]: Transform not supported - value has modifiers like 'property' or 'meta'
*/

import { computed } from '@ember/object';

// Do not transform as a computed property has readOnly and volatile with meta
const Foo3 = EmberObject.extend({
  firstName: '',
  lastName: '',

  fName2: computed('firstName', 'lastName', function() {
    return true;
  })
    .property('baz')
    .readOnly()
    .volatile()
    .meta({ type: 'Property' }),
});

```
---
<a id="decorators-invalid-4">**decorators-invalid-4**</a>

**Input** (<small>[decorators-invalid-4.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-4.input.js)</small>):
```js
// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});

```

**Output** (<small>[decorators-invalid-4.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-4.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo4':
    [lName1]: Transform not supported - call to 'add' can not be transformed
*/

// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});
```
---
<a id="decorators-invalid-5">**decorators-invalid-5**</a>

**Input** (<small>[decorators-invalid-5.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-5.input.js)</small>):
```js
import { computed } from '@ember/object';

// Do not transform as computed prop has `property`
const Foo5 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).property('baz'),
});
```

**Output** (<small>[decorators-invalid-5.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-5.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo5':
    [fName2]: Transform not supported - value has modifiers like 'property' or 'meta'
*/

import { computed } from '@ember/object';

// Do not transform as computed prop has `property`
const Foo5 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).property('baz'),
});
```
---
<a id="decorators-invalid-6">**decorators-invalid-6**</a>

**Input** (<small>[decorators-invalid-6.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-6.input.js)</small>):
```js
import { computed } from '@ember/object';

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});
```

**Output** (<small>[decorators-invalid-6.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-6.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo6':
    [fName2]: Transform not supported - value has modifiers like 'property' or 'meta'
*/

import { computed } from '@ember/object';

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});
```
---
<a id="decorators-invalid-7">**decorators-invalid-7**</a>

**Input** (<small>[decorators-invalid-7.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-7.input.js)</small>):
```js
// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});
```

**Output** (<small>[decorators-invalid-7.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-7.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo7':
    [actions]: Transform not supported - [click]: action name matches one of the lifecycle hooks. Rename and try again. See https://github.com/scalvert/ember-native-class-codemod/issues/34 for more details
*/

// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});

```
---
<a id="decorators-invalid-8">**decorators-invalid-8**</a>

**Input** (<small>[decorators-invalid-8.input.js](transforms/ember-object/__testfixtures__/decorators-invalid-8.input.js)</small>):
```js
const Foo8 = EmberObject.extend({
  statefulArray: [],
});
```

**Output** (<small>[decorators-invalid-8.output.js](transforms/ember-object/__testfixtures__/decorators-invalid-8.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo8':
    [statefulArray]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

const Foo8 = EmberObject.extend({
  statefulArray: [],
});

```
---
<a id="decorators">**decorators**</a>

**Input** (<small>[decorators.input.js](transforms/ember-object/__testfixtures__/decorators.input.js)</small>):
```js
import {
  alias,
  gt,
  equal,
  readOnly,
  reads,
  oneWay as enoWay,
  sum as add,
  map as computedMap,
  filter,
} from '@ember/object/computed';
import { get, set, observer as watcher, computed } from '@ember/object';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import layout from 'components/templates/foo';
import { someActionUtil } from 'some/action/util';
import NUMERIC_CONSTANT from 'constants/numbers';

const Foo1 = EmberObject.extend({
  tagName: 'div',
  classNames: ['test-class', 'custom-class'],
  a: '',
  b: service('store'),
  myController: controller('abc'),
  observedProp: watcher('xyz', function() {
    return 'observed';
  }),
  observedProp2: watcher('xyz', function() {
    return this._super(...arguments);
  }),
  event: on('click', function() {
    return 'abc';
  }),
  excitingChores: computedMap('chores', function(chore, index) {
    return chore.toUpperCase() + '!';
  }),
  remainingChores: filter('chores', function(chore, index, array) {
    return !chore.done;
  }),

  actions: {
    someActionUtil,
    /**
    Comments
    */
    bar(temp1) {},
    baz() {
      this._super(...arguments);
    },
    biz() {},
  },
});

var comp = EmberObject.extend({
  classNameBindings: ['isEnabled:enabled:disabled', 'a:b:c', 'c:d'],
  isEnabled: computed('a', 'c', function() {
    return false;
  }),
  a: true,
  c: '',
  attributeBindings: ['customHref:href'],

  customHref: 'http://emberjs.com',
});

const Foo2 = EmberObject.extend({
  firstName: null,
  lastName: null,

  /**
  Computed fullname
  */
  fullName: computed('firstName', 'lastName', {
    get(key) {
      return this._super(...arguments) && `${this.get('firstName')} ${this.get('lastName')}`;
    },
    set(key, value) {
      let [firstName, lastName] = value.split(/\s+/);
      this.set('firstName', firstName);
      this.set('lastName', lastName);
      return value;
    },
  }).readOnly(),
  /**
  Computed description
  */
  description: computed('fullName', 'age', 'country', function() {
    const desc = this._super(...arguments);
    if (desc) {
      return desc;
    }
    return `${this.get('fullName')}; Age: ${this.get('age')}; Country: ${this.get('country')}`;
  })
    .volatile()
    .readOnly(),

  /**
   * Fname
   */
  fName: alias('firstName'),

  /**
   * Fname1
   */
  fName1: alias('firstName'),

  /**
   * Fname2
   */
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).readOnly(),

  /**
   * Fname3
   */
  fName3: computed('firstName', 'lastName', function() {
    return true;
  }).volatile(),

  /**
   * Lname
   */
  lName: alias('firstName', 'lastName').readOnly(),

  /**
   * Lname1
   */
  lName1: add('description', 'lastName'),

  /**
   * Lname2
   */
  lName2: readOnly('description'),

  /**
   * Lname3
   */
  lName3: reads('description', 'lastName'),

  /**
   * Lname4
   */
  lName4: enoWay('description', 'lastName'),

  /**
   * Lname5
   */
  lName5: add('description', 'lastName').readOnly(),

  isEqualToLimit: equal('limit', NUMERIC_CONSTANT.LIMIT).readOnly(),

  isGreaterThanLimit: gt('limit', NUMERIC_CONSTANT).readOnly(),
});

const Foo3 = EmberObject.extend({
  layout,
});

```

**Output** (<small>[decorators.output.js](transforms/ember-object/__testfixtures__/decorators.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

import {
  attributeBindings,
  classNameBindings,
  classNames,
  layout as templateLayout,
  tagName,
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

  @watcher('xyz')
  observedProp2() {
    return super.observedProp2(...arguments);
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
    // https://github.com/scalvert/ember-native-class-codemod/blob/master/README.md
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

```
---
<a id="default-export">**default-export**</a>

**Input** (<small>[default-export.input.js](transforms/ember-object/__testfixtures__/default-export.input.js)</small>):
```js
export default EmberObject.extend({});

```

**Output** (<small>[default-export.output.js](transforms/ember-object/__testfixtures__/default-export.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
@classic
export default class DefaultExport extends EmberObject {}

```
---
<a id="double-quotes">**double-quotes**</a>

**Input** (<small>[double-quotes.input.js](transforms/ember-object/__testfixtures__/double-quotes.input.js)</small>):
```js
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

```

**Output** (<small>[double-quotes.output.js](transforms/ember-object/__testfixtures__/double-quotes.output.js)</small>):
```js
import classic from "ember-classic-decorator";

/**
 * Program comments
 */
@classic
class Foo1 extends Test.extend(MyMixin) {
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
class Foo2 extends EmberObject.extend(MixinA, MixinB) {}

```
---
<a id="ember-concurrency">**ember-concurrency**</a>

**Input** (<small>[ember-concurrency.input.js](transforms/ember-object/__testfixtures__/ember-concurrency.input.js)</small>):
```js
import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  fetchAlerts: task(function*() {
    let alerts = yield this.store.query('alert', {
      filter: { id: this.get('alert.id') }
    });
    return alerts.sortBy('createdAt').reverse();
  }).drop(),
});

```

**Output** (<small>[ember-concurrency.output.js](transforms/ember-object/__testfixtures__/ember-concurrency.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

@classic
export default class EmberConcurrency extends Component {
  @(task(function*() {
    let alerts = yield this.store.query('alert', {
      filter: { id: this.get('alert.id') }
    });
    return alerts.sortBy('createdAt').reverse();
  }).drop())
  fetchAlerts;
}

```
---
<a id="frozen">**frozen**</a>

**Input** (<small>[frozen.input.js](transforms/ember-object/__testfixtures__/frozen.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend({
  frozen: Object.freeze(['name'])
});
```

**Output** (<small>[frozen.output.js](transforms/ember-object/__testfixtures__/frozen.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

/**
 * Program comments
 */
@classic
class Foo extends Test {
 frozen = Object.freeze(['name']);
}

```
---
<a id="generator-method">**generator-method**</a>

**Input** (<small>[generator-method.input.js](transforms/ember-object/__testfixtures__/generator-method.input.js)</small>):
```js
const Foo = Test.extend({
  *gen() {
    yield 'hello';
  }
});

```

**Output** (<small>[generator-method.output.js](transforms/ember-object/__testfixtures__/generator-method.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

@classic
class Foo extends Test {
  *gen() {
    yield 'hello';
  }
}

```
---
<a id="generator-property">**generator-property**</a>

**Input** (<small>[generator-property.input.js](transforms/ember-object/__testfixtures__/generator-property.input.js)</small>):
```js
const Foo = Test.extend({
  gen: function*() {
    yield 'hello';
  }
});

```

**Output** (<small>[generator-property.output.js](transforms/ember-object/__testfixtures__/generator-property.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

@classic
class Foo extends Test {
  *gen() {
    yield 'hello';
  }
}

```
---
<a id="import">**import**</a>

**Input** (<small>[import.input.js](transforms/ember-object/__testfixtures__/import.input.js)</small>):
```js
import Service from '@ember/service';
import Controller from '@ember/controller';
import Evented, { on } from '@ember/object/evented';

const ser = Service.extend({});
const ctrl = Controller.extend({});
const evt = Service.extend(Evented, {
  e: on('click', function() {
    return 'e';
  }),
});

export { ser, ctrl, evt };

```

**Output** (<small>[import.output.js](transforms/ember-object/__testfixtures__/import.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import { on } from '@ember-decorators/object';
import Service from '@ember/service';
import Controller from '@ember/controller';
import Evented from '@ember/object/evented';

@classic
class ser extends Service {}

@classic
class ctrl extends Controller {}

@classic
class evt extends Service.extend(Evented) {
  @on('click')
  e() {
    return 'e';
  }
}

export { ser, ctrl, evt };

```
---
<a id="injecting-service">**injecting-service**</a>

**Input** (<small>[injecting-service.input.js](transforms/ember-object/__testfixtures__/injecting-service.input.js)</small>):
```js
import Service, { service as injectService } from '@ember/service';

export default Service.extend({
  something: injectService(),
  otherThing: injectService('some-thing'),
});

```

**Output** (<small>[injecting-service.output.js](transforms/ember-object/__testfixtures__/injecting-service.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import Service, { service as injectService } from '@ember/service';

@classic
export default class InjectingService extends Service {
  @injectService()
  something;

  @injectService('some-thing')
  otherThing;
}

```
---
<a id="logical-expression">**logical-expression**</a>

**Input** (<small>[logical-expression.input.js](transforms/ember-object/__testfixtures__/logical-expression.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend({
  location: ENV.locationType || 'history'
});
```

**Output** (<small>[logical-expression.output.js](transforms/ember-object/__testfixtures__/logical-expression.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

/**
 * Program comments
 */
@classic
class Foo extends Test {
 location = ENV.locationType || 'history';
}

```
---
<a id="mixin">**mixin**</a>

**Input** (<small>[mixin.input.js](transforms/ember-object/__testfixtures__/mixin.input.js)</small>):
```js
const HasMixin = Test.extend(MyMixin, {});

```

**Output** (<small>[mixin.output.js](transforms/ember-object/__testfixtures__/mixin.output.js)</small>):
```js
import classic from 'ember-classic-decorator';

@classic
class HasMixin extends Test.extend(MyMixin) {}

```
---
<a id="object-literal-with-action-hash-and-decorator">**object-literal-with-action-hash-and-decorator**</a>

**Input** (<small>[object-literal-with-action-hash-and-decorator.input.js](transforms/ember-object/__testfixtures__/object-literal-with-action-hash-and-decorator.input.js)</small>):
```js
import EmberObject, { action, set } from '@ember/object';

const Foo = EmberObject.extend({
  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  },

  actions: {
    toggleSnowing() {
      set(this, 'isSnowing', !this.isSnowing);
    }
  }
});

```

**Output** (<small>[object-literal-with-action-hash-and-decorator.output.js](transforms/ember-object/__testfixtures__/object-literal-with-action-hash-and-decorator.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import EmberObject, { action, set } from '@ember/object';

@classic
class Foo extends EmberObject {
  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  }

  @action
  toggleSnowing() {
    set(this, 'isSnowing', !this.isSnowing);
  }
}

```
---
<a id="object-literal-with-decorators-invalid-1">**object-literal-with-decorators-invalid-1**</a>

**Input** (<small>[object-literal-with-decorators-invalid-1.input.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-1.input.js)</small>):
```js
// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});
```

**Output** (<small>[object-literal-with-decorators-invalid-1.output.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-1.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo1':
    [computedMacro]: Transform not supported - can only transform object literal decorators on methods or properties with literal values (string, number, boolean, null, undefined)
    [computedMacro]: Transform not supported - call to 'customMacro' can not be transformed
*/

// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});
```
---
<a id="object-literal-with-decorators-invalid-2">**object-literal-with-decorators-invalid-2**</a>

**Input** (<small>[object-literal-with-decorators-invalid-2.input.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-2.input.js)</small>):
```js
// Do not transform if not on allowlist
const Foo2 = EmberObject.extend({
  @banned prop: '',
});
```

**Output** (<small>[object-literal-with-decorators-invalid-2.output.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-2.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo2':
    [prop]: Transform not supported - decorator '@banned' not included in ALLOWED_OBJECT_LITERAL_DECORATORS or option '--objectLiteralDecorators'
*/

// Do not transform if not on allowlist
const Foo2 = EmberObject.extend({
  @banned prop: '',
});

```
---
<a id="object-literal-with-decorators-invalid-3">**object-literal-with-decorators-invalid-3**</a>

**Input** (<small>[object-literal-with-decorators-invalid-3.input.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-3.input.js)</small>):
```js
// Do not transform array
const Foo3 = EmberObject.extend({
  @tracked arr: [1, 2, 3],
});
```

**Output** (<small>[object-literal-with-decorators-invalid-3.output.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-3.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo3':
    [arr]: Transform not supported - value is of type object. For more details: eslint-plugin-ember/avoid-leaking-state-in-ember-objects
*/

// Do not transform array
const Foo3 = EmberObject.extend({
  @tracked arr: [1, 2, 3],
});
```
---
<a id="object-literal-with-decorators-invalid-4">**object-literal-with-decorators-invalid-4**</a>

**Input** (<small>[object-literal-with-decorators-invalid-4.input.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-4.input.js)</small>):
```js
// Do not transform function expression if not on allowlist
const Foo4 = EmberObject.extend({
  @userAdded methodish: () => {},
});

```

**Output** (<small>[object-literal-with-decorators-invalid-4.output.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid-4.output.js)</small>):
```js
/*
Expect error:
  ValidationError: Validation errors for class 'Foo4':
    [methodish]: Transform not supported - decorator '@userAdded' not included in ALLOWED_OBJECT_LITERAL_DECORATORS or option '--objectLiteralDecorators'
*/

// Do not transform function expression if not on allowlist
const Foo4 = EmberObject.extend({
  @userAdded methodish: () => {},
});
```
---
<a id="object-literal-with-decorators">**object-literal-with-decorators**</a>

**Input** (<small>[object-literal-with-decorators.input.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators.input.js)</small>):
```js
import EmberObject, { action, set, computed } from '@ember/object';
import { dependentKeyCompat } from '@ember/object/compat';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { attribute, className } from '@ember-decorators/component';
import { observes, on } from '@ember-decorators/object';

const Foo = EmberObject.extend({

  // @ember/object

  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  },

  @computed('firstName', 'lastName')
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  },

  // @ember/object/compat

  @dependentKeyCompat
  fullName2: function() {
    return `${this.firstName} ${this.lastName}`;
  },

  // @ember/object/computed

  @alias('foo') hasAlias: undefined,
  @and('foo', 'bar') hasAnd: undefined,
  @bool('foo') hasBool: undefined,
  @collect('foo', 'bar') hasCollect: undefined,
  @deprecatingAlias('foo') hasDeprecatingAlias: undefined,
  @empty('foo') hasEmpty: undefined,
  @equal('foo', 'bar') hasEqual: undefined,
  @filterBy('foo', 'bar') hasFilterBy: undefined,
  @gt('foo', 'bar') hasGt: undefined,
  @gte('foo', 'bar') hasGte: undefined,
  @intersect('foo', 'bar') hasIntersect: undefined,
  @lt('foo', 'bar') hasLt: undefined,
  @lte('foo', 'bar') hasLte: undefined,
  @mapBy('foo', 'bar') hasMapBy: undefined,
  @match('foo', /bar/) hasMatch: undefined,
  @max('foo', 'bar') hasMax: undefined,
  @min('foo', 'bar') hasMin: undefined,
  @none('foo') hasNone: undefined,
  @not('foo') hasNot: undefined,
  @notEmpty('foo') hasNotEmpty: undefined,
  @oneWay('foo') hasOneWay: undefined,
  @or('foo', 'bar') hasOr: undefined,
  @readOnly('foo') hasReadOnly: undefined,
  @reads('foo') hasReads: undefined,
  @setDiff('foo', 'bar') hasSetDiff: undefined,
  @sum('foo', 'bar') hasSum: undefined,
  @union('foo', 'bar') hasUnion: undefined,
  @uniq('foo') hasUniq: undefined,
  @uniqBy('foo', 'bar') hasUniqBy: undefined,

  @filter('foo', function(foo, index, array) { return false })
  hasFilter: undefined,

  @map('foo', function(foo, index, array) { return 'bar' })
  hasMap: undefined,

  @sort('foo', function(a, b) {
    if (a.priority > b.priority) {
      return 1;
    } else if (a.priority < b.priority) {
      return -1;
    }

    return 0;
  })
  hasSort: undefined,

  // @glimmer/tracking

  @tracked count: 0,

  // @ember-decorators/component

  @attribute id: '1',

  @className('active', 'inactive')
  isActive: true,

  // @ember-decorators/object

  @observes('value')
  valueObserver() {
    // Executes whenever the "value" property changes
  },

  @on('barEvent')
  bar() {
    // Executes whenever barEvent is emitted
  },

  @userAdded
  yolo() {
    // methods always pass through decorators, even if not on allow-list
  }
});

```

**Output** (<small>[object-literal-with-decorators.output.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import { alias } from '@ember/object/computed';
import EmberObject, { action, set, computed } from '@ember/object';
import { dependentKeyCompat } from '@ember/object/compat';
import { tracked } from '@glimmer/tracking';
import { attribute, className } from '@ember-decorators/component';
import { observes, on } from '@ember-decorators/object';

@classic
class Foo extends EmberObject {
  // @ember/object

  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  }

  @computed('firstName', 'lastName')
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // @ember/object/compat

  @dependentKeyCompat
  fullName2() {
    return `${this.firstName} ${this.lastName}`;
  }

  // @ember/object/computed

  @alias('foo')
  hasAlias;

  @and('foo', 'bar')
  hasAnd;

  @bool('foo')
  hasBool;

  @collect('foo', 'bar')
  hasCollect;

  @deprecatingAlias('foo')
  hasDeprecatingAlias;

  @empty('foo')
  hasEmpty;

  @equal('foo', 'bar')
  hasEqual;

  @filterBy('foo', 'bar')
  hasFilterBy;

  @gt('foo', 'bar')
  hasGt;

  @gte('foo', 'bar')
  hasGte;

  @intersect('foo', 'bar')
  hasIntersect;

  @lt('foo', 'bar')
  hasLt;

  @lte('foo', 'bar')
  hasLte;

  @mapBy('foo', 'bar')
  hasMapBy;

  @match('foo', /bar/)
  hasMatch;

  @max('foo', 'bar')
  hasMax;

  @min('foo', 'bar')
  hasMin;

  @none('foo')
  hasNone;

  @not('foo')
  hasNot;

  @notEmpty('foo')
  hasNotEmpty;

  @oneWay('foo')
  hasOneWay;

  @or('foo', 'bar')
  hasOr;

  @readOnly('foo')
  hasReadOnly;

  @reads('foo')
  hasReads;

  @setDiff('foo', 'bar')
  hasSetDiff;

  @sum('foo', 'bar')
  hasSum;

  @union('foo', 'bar')
  hasUnion;

  @uniq('foo')
  hasUniq;

  @uniqBy('foo', 'bar')
  hasUniqBy;

  @filter('foo', function(foo, index, array) { return false })
  hasFilter;

  @map('foo', function(foo, index, array) { return 'bar' })
  hasMap;

  @sort('foo', function(a, b) {
    if (a.priority > b.priority) {
      return 1;
    } else if (a.priority < b.priority) {
      return -1;
    }

    return 0;
  })
  hasSort;

  // @glimmer/tracking

  @tracked
  count = 0;

  // @ember-decorators/component

  @attribute
  id = '1';

  @className('active', 'inactive')
  isActive = true;

  // @ember-decorators/object

  @observes('value')
  valueObserver() {
    // Executes whenever the "value" property changes
  }

  @on('barEvent')
  bar() {
    // Executes whenever barEvent is emitted
  }

  @userAdded
  yolo() {
    // methods always pass through decorators, even if not on allow-list
  }
}

```
---
<a id="runtime">**runtime**</a>

**Input** (<small>[runtime.input.js](transforms/ember-object/__testfixtures__/runtime.input.js)</small>):
```js
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

```

**Output** (<small>[runtime.output.js](transforms/ember-object/__testfixtures__/runtime.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import { off, unobserves } from '@ember-decorators/object';
import { action, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import Runtime from 'common/runtime';
import { service } from '@ember/service';

/**
 * Program comments
 */
@classic
export default class _Runtime extends Runtime.extend(MyMixin) {
  /**
   * Property comments
   */
  prop = 'defaultValue';

  boolProp = true;
  numProp = 123;
  [MY_VAL] = 'val';
  queryParams = {};

  @service
  error;

  @service('error')
  errorService;

  @unobserves('prop3', 'prop4')
  unobservedProp;

  @off('prop1', 'prop2')
  offProp;

  @computed('numProp')
  get numPlusOne() {
    return this.get('numProp') + 1;
  }

  @alias('numPlusOne')
  numPlusPlus;

  @customMacro()
  computedMacro;

  @customMacroWithInput({
    foo: 123,
    bar: 'baz'
  })
  anotherMacro;

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
    // https://github.com/scalvert/ember-native-class-codemod/blob/master/README.md
    // for more details.
    super.actions.overriddenActionMethod.call(this, ...arguments) && this.boolProp;
  }
}

```
<!--FIXTURES_CONTENT_END-->
