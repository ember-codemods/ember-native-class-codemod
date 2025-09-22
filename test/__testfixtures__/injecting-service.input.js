import Service, { service as injectService } from '@ember/service';

export default Service.extend({
  something: injectService(),
  otherThing: injectService('some-thing'),
});
