import EmberObject, { action, set, computed } from '@ember/object';
import { dependentKeyCompat } from '@ember/object/compat';
import { alias } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { attribute, className } from '@ember-decorators/component';
import { observes, on } from '@ember-decorators/object';

const Foo = EmberObject.extend({

  // @ember/object

  @action
  toggleShowing() {
    set(this, 'isShowing', !this.isShowing);
  },

  @computed('firstName', 'lastName')
  fullName() {
    return `${this.firstName} ${this.lastName}`;
  },

  // @ember/object/compat

  @dependentKeyCompat
  fullName2: function() {
    return `${this.firstName} ${this.lastName}`;
  },

  // @ember/object/computed

  @alias('foo') hasAlias: undefined,
  @and('foo', 'bar') hasAnd: undefined,
  @bool('foo') hasBool: undefined,
  @collect('foo', 'bar') hasCollect: undefined,
  @deprecatingAlias('foo') hasDeprecatingAlias: undefined,
  @empty('foo') hasEmpty: undefined,
  @equal('foo', 'bar') hasEqual: undefined,
  @filterBy('foo', 'bar') hasFilterBy: undefined,
  @gt('foo', 'bar') hasGt: undefined,
  @gte('foo', 'bar') hasGte: undefined,
  @intersect('foo', 'bar') hasIntersect: undefined,
  @lt('foo', 'bar') hasLt: undefined,
  @lte('foo', 'bar') hasLte: undefined,
  @mapBy('foo', 'bar') hasMapBy: undefined,
  @match('foo', /bar/) hasMatch: undefined,
  @max('foo', 'bar') hasMax: undefined,
  @min('foo', 'bar') hasMin: undefined,
  @none('foo') hasNone: undefined,
  @not('foo') hasNot: undefined,
  @notEmpty('foo') hasNotEmpty: undefined,
  @oneWay('foo') hasOneWay: undefined,
  @or('foo', 'bar') hasOr: undefined,
  @readOnly('foo') hasReadOnly: undefined,
  @reads('foo') hasReads: undefined,
  @setDiff('foo', 'bar') hasSetDiff: undefined,
  @sum('foo', 'bar') hasSum: undefined,
  @union('foo', 'bar') hasUnion: undefined,
  @uniq('foo') hasUniq: undefined,
  @uniqBy('foo', 'bar') hasUniqBy: undefined,

  @filter('foo', function(foo, index, array) { return false })
  hasFilter: undefined,

  @map('foo', function(foo, index, array) { return 'bar' })
  hasMap: undefined,

  @sort('foo', function(a, b) {
    if (a.priority > b.priority) {
      return 1;
    } else if (a.priority < b.priority) {
      return -1;
    }

    return 0;
  })
  hasSort: undefined,

  // @glimmer/tracking

  @tracked count: 0,

  // @ember-decorators/component

  @attribute id: '1',

  @className('active', 'inactive')
  isActive: true,

  // @ember-decorators/object

  @observes('value')
  valueObserver() {
    // Executes whenever the "value" property changes
  },

  @on('barEvent')
  bar() {
    // Executes whenever barEvent is emitted
  },

  @userAdded
  yolo() {
    // methods always pass through decorators, even if not on allow-list
  }
});
