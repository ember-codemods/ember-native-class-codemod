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
