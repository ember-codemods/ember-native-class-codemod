const Foo = Test.extend({
  async myAsyncMethod() {
    await Promise.resolve('hello');
  }
});
