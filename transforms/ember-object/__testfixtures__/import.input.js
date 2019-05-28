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
