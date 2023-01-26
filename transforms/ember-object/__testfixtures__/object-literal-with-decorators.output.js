import classic from 'ember-classic-decorator';

// Allowlisted decorator, primitive value. Should just work
@classic
class Foo extends EmberObject {
  @tracked
  foo = '';
}
