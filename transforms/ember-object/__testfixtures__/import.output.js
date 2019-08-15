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
