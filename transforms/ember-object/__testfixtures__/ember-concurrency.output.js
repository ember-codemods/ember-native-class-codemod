import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

@classic
export default class EmberConcurrency extends Component {
  @(task(function*() {
    let alerts = yield this.store.query('alert', {
      filter: { id: this.get('alert.id') }
    });
    return alerts.sortBy('createdAt').reverse();
  }).drop())
  fetchAlerts;
}
