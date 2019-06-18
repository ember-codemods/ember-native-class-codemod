# ember-object


## Usage

```
npx ember-es6-class-codemod ember-object path/of/files/ or/some**/*glob.js

# or

yarn global add ember-es6-class-codemod
ember-es6-class-codemod ember-object path/of/files/ or/some**/*glob.js
```

## Input / Output

<!--FIXTURES_TOC_START-->
* [action.invalid](#action.invalid)
* [basic](#basic)
* [class-fields.invalid](#class-fields.invalid)
* [class-fields.valid](#class-fields.valid)
* [decorators-disabled](#decorators-disabled)
* [decorators](#decorators)
* [decorators.invalid](#decorators.invalid)
* [default.export](#default.export)
* [import](#import)
* [runtime](#runtime)
* [single.quotes](#single.quotes)
<!--FIXTURES_TOC_END-->

<!--FIXTURES_CONTENT_START-->
---
<a id="action.invalid">**action.invalid**</a>

**Input** (<small>[action.invalid.input.js](transforms/ember-object/__testfixtures__/action.invalid.input.js)</small>):
```js
const Foo = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get("bar")();
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, "biz")();
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, "baz");
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send("sendBaz");
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    }
  }
});

```

**Output** (<small>[action.invalid.output.js](transforms/ember-object/__testfixtures__/action.invalid.output.js)</small>):
```js
const Foo = EmberObject.extend({
  actions: {
    bar() {
      this._super(...arguments);
      this.get("bar")();
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    biz() {
      this._super(...arguments);
      get(this, "biz")();
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    baz() {
      this._super(...arguments);
      tryInvoke(this, "baz");
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    sendBaz() {
      this._super(...arguments);
      this.send("sendBaz");
    }
  }
});

const Foo = EmberObject.extend({
  actions: {
    thisBaz() {
      this._super(...arguments);
      this.thisBaz();
    }
  }
});

```
---
<a id="basic">**basic**</a>

**Input** (<small>[basic.input.js](transforms/ember-object/__testfixtures__/basic.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend(MyMixin, {
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
  }
});

const Foo = EmberObject.extend(MixinA, MixinB);

```

**Output** (<small>[basic.output.js](transforms/ember-object/__testfixtures__/basic.output.js)</small>):
```js
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

class Foo extends EmberObject.extend(MixinA, MixinB) {}

```
---
<a id="class-fields.invalid">**class-fields.invalid**</a>

**Input** (<small>[class-fields.invalid.input.js](transforms/ember-object/__testfixtures__/class-fields.invalid.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend({
  /**
   * Property comments
   */
  prop: "defaultValue",
  boolProp: true,
  numProp: 123,
  [MY_VAL]: "val",

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
  }
});

```

**Output** (<small>[class-fields.invalid.output.js](transforms/ember-object/__testfixtures__/class-fields.invalid.output.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend({
  /**
   * Property comments
   */
  prop: "defaultValue",
  boolProp: true,
  numProp: 123,
  [MY_VAL]: "val",

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
  }
});

```
---
<a id="class-fields.valid">**class-fields.valid**</a>

**Input** (<small>[class-fields.valid.input.js](transforms/ember-object/__testfixtures__/class-fields.valid.input.js)</small>):
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
  }
});

```

**Output** (<small>[class-fields.valid.output.js](transforms/ember-object/__testfixtures__/class-fields.valid.output.js)</small>):
```js
/**
 * Program comments
 */
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
<a id="decorators-disabled">**decorators-disabled**</a>

**Input** (<small>[decorators-disabled.input.js](transforms/ember-object/__testfixtures__/decorators-disabled.input.js)</small>):
```js
import { observer, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";

// Do not transform
const Foo = EmberObject.extend({
  computed: computed({
    get() {},
    set() {}
  })
});

// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform
const Foo = EmberObject.extend({
  tagName: "div"
});

// Do not transform
const Foo = EmberObject.extend({
  classNames: []
});

// Do not transform
const Foo = EmberObject.extend({
  classNameBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo = EmberObject.extend({
  attributeBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo = EmberObject.extend({
  actions: {
    bar() {}
  }
});

// Do not transform
const Foo = EmberObject.extend({
  observer: observer()
});

// Do not transform
const Foo = EmberObject.extend({
  event: on()
});

// Do not transform
const Foo = EmberObject.extend({
  event: service()
});

// Do not transform
const Foo = EmberObject.extend({
  event: controller()
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});

// Do not transform
const Foo = EmberObject.extend({
  layout: "div"
});

```

**Output** (<small>[decorators-disabled.output.js](transforms/ember-object/__testfixtures__/decorators-disabled.output.js)</small>):
```js
import { observer, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";

// Do not transform
const Foo = EmberObject.extend({
  computed: computed({
    get() {},
    set() {}
  })
});

// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform
const Foo = EmberObject.extend({
  tagName: "div"
});

// Do not transform
const Foo = EmberObject.extend({
  classNames: []
});

// Do not transform
const Foo = EmberObject.extend({
  classNameBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo = EmberObject.extend({
  attributeBindings: ["foo"],
  foo: "val"
});

// Do not transform
const Foo = EmberObject.extend({
  actions: {
    bar() {}
  }
});

// Do not transform
const Foo = EmberObject.extend({
  observer: observer()
});

// Do not transform
const Foo = EmberObject.extend({
  event: on()
});

// Do not transform
const Foo = EmberObject.extend({
  event: service()
});

// Do not transform
const Foo = EmberObject.extend({
  event: controller()
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});

// Do not transform
const Foo = EmberObject.extend({
  layout: "div"
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
  filter
} from "@ember/object/computed";
import { get, set, observer as watcher, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";
import layout from "components/templates/foo";
import { someActionUtil } from "some/action/util";
import NUMERIC_CONSTANT from "constants/numbers";

const Foo = EmberObject.extend({
  tagName: "div",
  classNames: ["test-class", "custom-class"],
  a: "",
  b: service("store"),
  myController: controller("abc"),
  observedProp: watcher("xyz", function() {
    return "observed";
  }),
  event: on("click", function() {
    return "abc";
  }),
  excitingChores: computedMap("chores", function(chore, index) {
    return chore.toUpperCase() + "!";
  }),
  remainingChores: filter("chores", function(chore, index, array) {
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
    biz() {}
  }
});

var comp = EmberObject.extend({
  classNameBindings: ["isEnabled:enabled:disabled", "a:b:c", "c:d"],
  isEnabled: computed("a", "c", function() {
    return false;
  }),
  a: true,
  c: "",
  attributeBindings: ["customHref:href"],

  customHref: "http://emberjs.com"
});

const Foo = EmberObject.extend({
  firstName: null,
  lastName: null,

  /**
  Computed fullname
  */
  fullName: computed("firstName", "lastName", {
    get(key) {
      return (
        this._super(...arguments) &&
        `${this.get("firstName")} ${this.get("lastName")}`
      );
    },
    set(key, value) {
      let [firstName, lastName] = value.split(/\s+/);
      this.set("firstName", firstName);
      this.set("lastName", lastName);
      return value;
    }
  }).readOnly(),
  /**
  Computed description
  */
  description: computed("fullName", "age", "country", function() {
    const desc = this._super(...arguments);
    if (desc) {
      return desc;
    }
    return `${this.get(
      "fullName"
    )}; Age: ${this.get("age")}; Country: ${this.get("country")}`;
  })
    .volatile()
    .readOnly(),

  /**
   * Fname
   */
  fName: alias("firstName"),

  /**
   * Fname1
   */
  fName1: alias("firstName"),

  /**
   * Fname2
   */
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).readOnly(),

  /**
   * Fname3
   */
  fName3: computed("firstName", "lastName", function() {
    return true;
  }).volatile(),

  /**
   * Lname
   */
  lName: alias("firstName", "lastName").readOnly(),

  /**
   * Lname1
   */
  lName1: add("description", "lastName"),

  /**
   * Lname2
   */
  lName2: readOnly("description"),

  /**
   * Lname3
   */
  lName3: reads("description", "lastName"),

  /**
   * Lname4
   */
  lName4: enoWay("description", "lastName"),

  /**
   * Lname5
   */
  lName5: add("description", "lastName").readOnly(),

  isEqualToLimit: equal("limit", NUMERIC_CONSTANT.LIMIT).readOnly(),

  isGreaterThanLimit: gt("limit", NUMERIC_CONSTANT).readOnly()
});

const Foo = EmberObject.extend({
  layout
});

```

**Output** (<small>[decorators.output.js](transforms/ember-object/__testfixtures__/decorators.output.js)</small>):
```js
import { attribute, className, classNames, tagName, layout as templateLayout } from "@ember-decorators/component";
import { observes as watcher, on } from "@ember-decorators/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";

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
} from "@ember/object/computed";

import { get, set, action, computed } from "@ember/object";
import layout from "components/templates/foo";
import { someActionUtil } from "some/action/util";
import NUMERIC_CONSTANT from "constants/numbers";

@tagName("div")
@classNames("test-class", "custom-class")
class Foo extends EmberObject {
  a = "";

  @service("store")
  b;

  @controller("abc")
  myController;

  @watcher("xyz")
  observedProp() {
    return "observed";
  }

  @on("click")
  event() {
    return "abc";
  }

  @computedMap("chores", function(chore, index) {
    return chore.toUpperCase() + "!";
  })
  excitingChores;

  @filter("chores", function(chore, index, array) {
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
    // https: //github.com/scalvert/ember-es6-class-codemod/blob/master/README.md
    // for more details.
    super.actions.baz.call(this, ...arguments);
  }

  @action
  biz() {}
}

class Comp extends EmberObject {
  @computed("a", "c")
  @className("enabled", "disabled")
  get isEnabled() {
    return false;
  }

  @className("b", "c")
  a = true;

  @className("d")
  c = "";

  @attribute("href")
  customHref = "http://emberjs.com";
}

class Foo extends EmberObject {
  firstName = null;
  lastName = null;

  /**
  Computed fullname
  */
  @(computed("firstName", "lastName").readOnly())
  get fullName() {
    return super.fullName &&
    `${this.get("firstName")} ${this.get("lastName")}`;
  }

  set fullName(value) {
    let [firstName, lastName] = value.split(/\s+/);
    this.set("firstName", firstName);
    this.set("lastName", lastName);
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
    return `${this.get(
      "fullName"
    )}; Age: ${this.get("age")}; Country: ${this.get("country")}`;
  }

  /**
   * Fname
   */
  @alias("firstName")
  fName;

  /**
   * Fname1
   */
  @alias("firstName")
  fName1;

  /**
   * Fname2
   */
  @(computed("firstName", "lastName").readOnly())
  get fName2() {
    return true;
  }

  /**
   * Fname3
   */
  @(computed("firstName", "lastName").volatile())
  get fName3() {
    return true;
  }

  /**
   * Lname
   */
  @(alias("firstName", "lastName").readOnly())
  lName;

  /**
   * Lname1
   */
  @add("description", "lastName")
  lName1;

  /**
   * Lname2
   */
  @readOnly("description")
  lName2;

  /**
   * Lname3
   */
  @reads("description", "lastName")
  lName3;

  /**
   * Lname4
   */
  @enoWay("description", "lastName")
  lName4;

  /**
   * Lname5
   */
  @(add("description", "lastName").readOnly())
  lName5;

  @(equal("limit", NUMERIC_CONSTANT.LIMIT).readOnly())
  isEqualToLimit;

  @(gt("limit", NUMERIC_CONSTANT).readOnly())
  isGreaterThanLimit;
}

@templateLayout(layout)
class Foo extends EmberObject {}

```
---
<a id="decorators.invalid">**decorators.invalid**</a>

**Input** (<small>[decorators.invalid.input.js](transforms/ember-object/__testfixtures__/decorators.invalid.input.js)</small>):
```js
// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});

// Do not transform as a computed property has readOnly and volatile with meta
const Foo = EmberObject.extend({
  firstName: "",
  lastName: "",

  fName2: computed("firstName", "lastName", function() {
    return true;
  })
    .property("baz")
    .readOnly()
    .volatile()
    .meta({ type: "Property" })
});

// Do not transform as a computed meta has volatile
const Foo = EmberObject.extend({
  lName1: add("description", "lastName").volatile()
});

// Do not transform as computed prop has `property`
const Foo = EmberObject.extend({
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).property("baz")
});

// Do not transform as computed prop has `meta`
const Foo = EmberObject.extend({
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).meta({ type: "Property" })
});

// Do not transform as action name matches lifecycle hook
const Foo = EmberObject.extend({
  actions: {
    click() {
      this.set("clicked", true);
    }
  }
});

```

**Output** (<small>[decorators.invalid.output.js](transforms/ember-object/__testfixtures__/decorators.invalid.output.js)</small>):
```js
// Do not transform
const Foo = EmberObject.extend({
  statefulObject: {},
  statefulArray: []
});

// Do not transform if not a primitive value
const Foo = EmberObject.extend({
  macroValue: macro()
});

// Do not transform as a computed property has readOnly and volatile with meta
const Foo = EmberObject.extend({
  firstName: "",
  lastName: "",

  fName2: computed("firstName", "lastName", function() {
    return true;
  })
    .property("baz")
    .readOnly()
    .volatile()
    .meta({ type: "Property" })
});

// Do not transform as a computed meta has volatile
const Foo = EmberObject.extend({
  lName1: add("description", "lastName").volatile()
});

// Do not transform as computed prop has `property`
const Foo = EmberObject.extend({
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).property("baz")
});

// Do not transform as computed prop has `meta`
const Foo = EmberObject.extend({
  fName2: computed("firstName", "lastName", function() {
    return true;
  }).meta({ type: "Property" })
});

// Do not transform as action name matches lifecycle hook
const Foo = EmberObject.extend({
  actions: {
    click() {
      this.set("clicked", true);
    }
  }
});

```
---
<a id="default.export">**default.export**</a>

**Input** (<small>[default.export.input.js](transforms/ember-object/__testfixtures__/default.export.input.js)</small>):
```js
export default EmberObject.extend({});

```

**Output** (<small>[default.export.output.js](transforms/ember-object/__testfixtures__/default.export.output.js)</small>):
```js
export default class DefaultExportInput extends EmberObject {}

```
---
<a id="import">**import**</a>

**Input** (<small>[import.input.js](transforms/ember-object/__testfixtures__/import.input.js)</small>):
```js
import Service from "@ember/service";
import Controller from "@ember/controller";
import Evented, { on } from "@ember/object/evented";

const ser = Service.extend({});
const ctrl = Controller.extend({});
const evt = Service.extend(Evented, {
  e: on("click", function() {
    return "e";
  })
});

export { ser, ctrl, evt };

```

**Output** (<small>[import.output.js](transforms/ember-object/__testfixtures__/import.output.js)</small>):
```js
import { on } from "@ember-decorators/object";
import Service from "@ember/service";
import Controller from "@ember/controller";
import Evented from "@ember/object/evented";

class Ser extends Service {}
class Ctrl extends Controller {}

class Evt extends Service.extend(Evented) {
  @on("click")
  e() {
    return "e";
  }
}

export { Ser, Ctrl, Evt };

```
---
<a id="runtime">**runtime**</a>

**Input** (<small>[runtime.input.js](transforms/ember-object/__testfixtures__/runtime.input.js)</small>):
```js
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

  computedMacro: customMacro(),

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

```

**Output** (<small>[runtime.output.js](transforms/ember-object/__testfixtures__/runtime.output.js)</small>):
```js
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

```
---
<a id="single.quotes">**single.quotes**</a>

**Input** (<small>[single.quotes.input.js](transforms/ember-object/__testfixtures__/single.quotes.input.js)</small>):
```js
/**
 * Program comments
 */
const Foo = Test.extend(MyMixin, {
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
  }
});

const Foo = EmberObject.extend(MixinA, MixinB);

```

**Output** (<small>[single.quotes.output.js](transforms/ember-object/__testfixtures__/single.quotes.output.js)</small>):
```js
/**
 * Program comments
 */
class Foo extends Test.extend(MyMixin) {
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

class Foo extends EmberObject.extend(MixinA, MixinB) {}

```
<!--FIXTURES_CONTENT_END-->