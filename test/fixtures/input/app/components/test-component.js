import Component from '@ember/component';
import { computed } from '@ember/object';

function fullNameMacro() {
  return computed('firstName', 'lastName', function() {
    return `${this.firstName} ${this.lastName}`;
  });
}

export default Component.extend({
  fullName: fullNameMacro(),
});
