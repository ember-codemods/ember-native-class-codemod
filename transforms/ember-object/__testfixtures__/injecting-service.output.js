import classic from 'ember-classic-decorator';
import Service, { service as injectService } from '@ember/service';

@classic
export default class InjectingServiceService extends Service {
  @injectService()
  something;

  @injectService('some-thing')
  otherThing;
}
