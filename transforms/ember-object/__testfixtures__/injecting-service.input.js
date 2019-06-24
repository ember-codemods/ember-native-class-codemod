import Service, { service as injectService } from '@ember/service';

export default Service.extend({
  something: service(),
  otherThing: service('some-thing')
});
