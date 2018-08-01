import { alias, sum as add } from "@ember/object/computed";
import { get, set, observer, computed } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { on } from "@ember/object/evented";
import layout from "components/templates/foo";

@tagName("div")
@classNames(["test-class", "custom-class"])
class Foo extends EmberObject {
  a = "";

  @service("store")
  b;

  @controller("abc")
  myController;

  @observes("xyz")
  observedProp;

  @on("click")
  event;

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
  @className("enabled", "disabled")
  isEnabled = false;

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
  get fullName(key) {
    return `${this.get("firstName")} ${this.get("lastName")}`;
  }

  set fullName(key, value) {
    let [firstName, lastName] = value.split(/\s+/);
    this.set("firstName", firstName);
    this.set("lastName", lastName);
    return value;
  }

  /**
  Computed description
  */
  @computed("fullName", "age", "country")
  description() {
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
   * Lname
   */
  @alias.readOnly("firstName", "lastName")
  lName;

  /**
   * Lname1
   */
  @add.volatile("description", "lastName")
  lName1;
}

@layout(layout)
class Foo extends EmberObject {}