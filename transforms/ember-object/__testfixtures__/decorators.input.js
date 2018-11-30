import {
  alias,
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
  lName5: add("description", "lastName").readOnly()
});

const Foo = EmberObject.extend({
  layout
});
