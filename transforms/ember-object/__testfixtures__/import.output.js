import classic from 'ember-classic-decorator';
import { on } from '@ember-decorators/object';
import Service from '@ember/service';
import Controller from '@ember/controller';
import Evented from '@ember/object/evented';

@classic
class Ser extends Service {}

@classic
class Ctrl extends Controller {}

@classic
class Evt extends Service.extend(Evented) {
  @on('click')
  e() {
    return 'e';
  }
}

export { Ser, Ctrl, Evt };
