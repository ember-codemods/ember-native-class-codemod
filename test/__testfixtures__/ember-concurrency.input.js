import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  fetchAlerts: task(function*() {
    let alerts = yield this.store.query('alert', {
      filter: { id: this.get('alert.id') }
    });
    return alerts.sortBy('createdAt').reverse();
  }).drop(),
});
