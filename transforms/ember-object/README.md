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
* [action-invalid](#action-invalid)
* [basic-computed](#basic-computed)
* [basic](#basic)
* [chained-class-definition](#chained-class-definition)
* [class-fields](#class-fields)
* [class-reopen](#class-reopen)
* [decorators-invalid](#decorators-invalid)
* [decorators](#decorators)
* [default-export](#default-export)
* [double-quotes](#double-quotes)
* [ember-concurrency](#ember-concurrency)
* [frozen](#frozen)
* [import](#import)
* [injecting-service](#injecting-service)
* [logical-expression](#logical-expression)
* [mixin](#mixin)
* [object-literal-with-action-hash-and-decorator](#object-literal-with-action-hash-and-decorator)
* [object-literal-with-decorators-invalid](#object-literal-with-decorators-invalid)
* [object-literal-with-decorators](#object-literal-with-decorators)
* [partial-transform](#partial-transform)
* [runtime](#runtime)
<!--FIXTURES_TOC_END-->

## <!--FIXTURES_CONTENT_START-->
---
<a id="action-invalid">**action-invalid**</a>

**Input** (<small>[action-invalid.input.js](transforms/ember-object/__testfixtures__/action-invalid.input.js)</small>):
```js
const Foo1 = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});

const Foo2 = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});

const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});

const Foo4 = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});

const Foo5 = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    },
  },
});

```

**Output** (<small>[action-invalid.output.js](transforms/ember-object/__testfixtures__/action-invalid.output.js)</small>):
```js
const Foo1 = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get('bar')();
    },
  },
});

const Foo2 = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, 'biz')();
    },
  },
});

const Foo3 = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, 'baz');
    },
  },
});

const Foo4 = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send('sendBaz');
    },
  },
});

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
<a id="decorators-invalid">**decorators-invalid**</a>

**Input** (<small>[decorators-invalid.input.js](transforms/ember-object/__testfixtures__/decorators-invalid.input.js)</small>):
```js
// Do not transform
const Foo1 = EmberObject.extend({
  statefulObject: {},
});

// Do not transform if not a primitive value
const Foo2 = EmberObject.extend({
  macroValue: macro(),
});

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

// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});

// Do not transform as computed prop has `property`
const Foo5 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).property('baz'),
});

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});

// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});

const Foo8 = EmberObject.extend({
  statefulArray: [],
});
```

**Output** (<small>[decorators-invalid.output.js](transforms/ember-object/__testfixtures__/decorators-invalid.output.js)</small>):
```js
// Do not transform
const Foo1 = EmberObject.extend({
  statefulObject: {},
});

// Do not transform if not a primitive value
const Foo2 = EmberObject.extend({
  macroValue: macro(),
});

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

// Do not transform as a computed meta has volatile
const Foo4 = EmberObject.extend({
  lName1: add('description', 'lastName').volatile(),
});

// Do not transform as computed prop has `property`
const Foo5 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).property('baz'),
});

// Do not transform as computed prop has `meta`
const Foo6 = EmberObject.extend({
  fName2: computed('firstName', 'lastName', function() {
    return true;
  }).meta({ type: 'Property' }),
});

// Do not transform as action name matches lifecycle hook
const Foo7 = EmberObject.extend({
  actions: {
    click() {
      this.set('clicked', true);
    },
  },
});

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
<a id="object-literal-with-decorators-invalid">**object-literal-with-decorators-invalid**</a>

**Input** (<small>[object-literal-with-decorators-invalid.input.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid.input.js)</small>):
```js
// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});

// Do not transform if not on allowlist
const Foo2 = EmberObject.extend({
  @banned prop: '',
});

// Do not transform array
const Foo3 = EmberObject.extend({
  @tracked arr: [1, 2, 3],
});

// Do not function expression if not on allowlist
const Foo4 = EmberObject.extend({
  @userAdded methodish: () => {},
});

```

**Output** (<small>[object-literal-with-decorators-invalid.output.js](transforms/ember-object/__testfixtures__/object-literal-with-decorators-invalid.output.js)</small>):
```js
// Do not transform if not a primitive value
const Foo1 = EmberObject.extend({
  @tracked computedMacro: customMacro(),
});

// Do not transform if not on allowlist
const Foo2 = EmberObject.extend({
  @banned prop: '',
});

// Do not transform array
const Foo3 = EmberObject.extend({
  @tracked arr: [1, 2, 3],
});

// Do not function expression if not on allowlist
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
<a id="partial-transform">**partial-transform**</a>

**Input** (<small>[partial-transform.input.js](transforms/ember-object/__testfixtures__/partial-transform.input.js)</small>):
```js
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';

// Should succeed
const Foo1 = EmberObject.extend({
  store: service('store'),
});

// Should fail
const Foo2 = EmberObject.extend({
  macroValue: macro(),
})

```

**Output** (<small>[partial-transform.output.js](transforms/ember-object/__testfixtures__/partial-transform.output.js)</small>):
```js
import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';

// Should succeed
@classic
class Foo1 extends EmberObject {
  @service('store')
  store;
}

// Should fail
const Foo2 = EmberObject.extend({
  macroValue: macro(),
})

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
