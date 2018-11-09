import { layout, classNames, tagName } from "@ember-decorators/component";
import { sum as add, overridableReads as enoWay, overridableReads, reads, alias } from "@ember-decorators/object/computed";
import { get, set } from "@ember/object";
import { readOnly, volatile, computed, observes as watcher } from "@ember-decorators/object";
import { controller } from "@ember-decorators/controller";
import { service } from "@ember-decorators/service";
import { on } from "@ember-decorators/object/evented";
import layout from "components/templates/foo";

@tagName("div")
@classNames(["test-class", "custom-class"])
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

  /**
  Comments
  */
  @action
  bar(temp1) {}

  @action
  baz() {
    super.baz(...arguments);
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
  @computed("firstName", "lastName")
  @readOnly
  get fullName() {
    return `${this.get("firstName")} ${this.get("lastName")}`;
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
  @computed("firstName", "lastName")
  @readOnly
  get fName2() {
    return true;
  }

  /**
   * Fname3
   */
  @computed("firstName", "lastName")
  @volatile
  get fName3() {
    return true;
  }

  /**
   * Lname
   */
  @alias("firstName", "lastName")
  @readOnly
  lName;

  /**
   * Lname1
   */
  @add("description", "lastName")
  lName1;

  /**
   * Lname2
   */
  @reads("description")
  lName2;

  /**
   * Lname3
   */
  @overridableReads("description", "lastName")
  lName3;

  /**
   * Lname4
   */
  @enoWay("description", "lastName")
  lName4;

  /**
   * Lname5
   */
  @add("description", "lastName")
  @readOnly
  lName5;
}

@layout(layout)
class Foo extends EmberObject {}
