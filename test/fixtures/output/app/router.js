import classic from 'ember-classic-decorator';
import EmberRouter from '@ember/routing/router';
import config from './config/environment';

@classic
class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {});

export default Router;
