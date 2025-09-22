import classic from 'ember-classic-decorator';
import { alias } from '@ember/object/computed';
import EmberObject, { action, set, computed } from '@ember/object';
import { dependentKeyCompat } from '@ember/object/compat';
import { tracked } from '@glimmer/tracking';
import { attribute, className } from '@ember-decorators/component';
import { observes, on } from '@ember-decorators/object';

@classic
class Foo extends EmberObject {
  // @ember/object

  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  }

  @computed('firstName', 'lastName')
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // @ember/object/compat

  @dependentKeyCompat
  fullName2() {
    return `${this.firstName} ${this.lastName}`;
  }

  // @ember/object/computed

  @alias('foo')
  hasAlias;

  @and('foo', 'bar')
  hasAnd;

  @bool('foo')
  hasBool;

  @collect('foo', 'bar')
  hasCollect;

  @deprecatingAlias('foo')
  hasDeprecatingAlias;

  @empty('foo')
  hasEmpty;

  @equal('foo', 'bar')
  hasEqual;

  @filterBy('foo', 'bar')
  hasFilterBy;

  @gt('foo', 'bar')
  hasGt;

  @gte('foo', 'bar')
  hasGte;

  @intersect('foo', 'bar')
  hasIntersect;

  @lt('foo', 'bar')
  hasLt;

  @lte('foo', 'bar')
  hasLte;

  @mapBy('foo', 'bar')
  hasMapBy;

  @match('foo', /bar/)
  hasMatch;

  @max('foo', 'bar')
  hasMax;

  @min('foo', 'bar')
  hasMin;

  @none('foo')
  hasNone;

  @not('foo')
  hasNot;

  @notEmpty('foo')
  hasNotEmpty;

  @oneWay('foo')
  hasOneWay;

  @or('foo', 'bar')
  hasOr;

  @readOnly('foo')
  hasReadOnly;

  @reads('foo')
  hasReads;

  @setDiff('foo', 'bar')
  hasSetDiff;

  @sum('foo', 'bar')
  hasSum;

  @union('foo', 'bar')
  hasUnion;

  @uniq('foo')
  hasUniq;

  @uniqBy('foo', 'bar')
  hasUniqBy;

  @filter('foo', function(foo, index, array) { return false })
  hasFilter;

  @map('foo', function(foo, index, array) { return 'bar' })
  hasMap;

  @sort('foo', function(a, b) {
    if (a.priority > b.priority) {
      return 1;
    } else if (a.priority < b.priority) {
      return -1;
    }

    return 0;
  })
  hasSort;

  // @glimmer/tracking

  @tracked
  count = 0;

  // @ember-decorators/component

  @attribute
  id = '1';

  @className('active', 'inactive')
  isActive = true;

  // @ember-decorators/object

  @observes('value')
  valueObserver() {
    // Executes whenever the "value" property changes
  }

  @on('barEvent')
  bar() {
    // Executes whenever barEvent is emitted
  }

  @userAdded
  yolo() {
    // methods always pass through decorators, even if not on allow-list
  }
}
