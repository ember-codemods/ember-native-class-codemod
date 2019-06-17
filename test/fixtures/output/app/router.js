import EmberRouter from '@ember/routing/router';
import config from './config/environment';

class RouterRouter extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

RouterRouter.map(function() {
});

export default RouterRouter;
