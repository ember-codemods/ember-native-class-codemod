import classic from 'ember-classic-decorator';

@classic
class Foo extends Test {
  *gen() {
    yield 'hello';
  }
}
