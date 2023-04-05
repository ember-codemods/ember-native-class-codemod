import classic from 'ember-classic-decorator';

@classic
class Foo extends Test {
  async myAsyncMethod() {
    await Promise.resolve('hello');
  }
}
