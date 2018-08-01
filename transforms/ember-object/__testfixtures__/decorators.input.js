import { alias, sum as add } from "@ember/object/computed";
import { get, set, observer, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";
import layout from "components/templates/foo";

const Foo = EmberObject.extend({
  tagName: "div",
  classNames: ["test-class", "custom-class"],
  a: "",
  b: service("store"),
  myController: controller("abc"),
  observedProp: observer("xyz"),
  event: on("click"),

  actions: {
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
  isEnabled: false,
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
      return `${this.get("firstName")} ${this.get("lastName")}`;
    },
    set(key, value) {
      let [firstName, lastName] = value.split(/\s+/);
      this.set("firstName", firstName);
      this.set("lastName", lastName);
      return value;
    }
  }),

  /**
  Computed description
  */
  description: computed("fullName", "age", "country", function() {
    return `${this.get(
      "fullName"
    )}; Age: ${this.get("age")}; Country: ${this.get("country")}`;
  }),

  /**
   * Fname
   */
  fName: alias("firstName"),

  /**
   * Lname
   */
  lName: alias("firstName", "lastName").readOnly(),

  /**
   * Lname1
   */
  lName1: add("description", "lastName").volatile()
});

const Foo = EmberObject.extend({
  layout
});
