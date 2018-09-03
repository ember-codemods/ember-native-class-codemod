import { sum as add, alias } from "@ember-decorators/object/computed";
import { get, set } from "@ember/object";
import { computed, observes } from "@ember-decorators/object";
import { controller } from "@ember-decorators/controller";
import { service } from "@ember-decorators/service";
import { on } from "@ember-decorators/object/evented";
import layout from "components/templates/foo";
import MixinA from "mixins/A";
import MixinB from "mixins/B";

class Foo extends Controller.extend(MixinA) {}

class Foo extends Controller.extend(MixinA) {
  biz = "div";
}

@tagName("div")
@classNames(["test-class", "custom-class"])
class Foo extends Controller.extend(MixinA) {
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

class Comp extends Controller.extend(MixinB) {
  @className("enabled", "disabled")
  isEnabled = false;

  @className("b", "c")
  a = true;

  @className("d")
  c = "";

  @attribute("href")
  customHref = "http://emberjs.com";
}

class Foo extends Controller.extend(MixinA, MixinB) {
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
class Foo extends Controller {}