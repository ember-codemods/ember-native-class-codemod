const Foo = Test.extend({
  myAsyncMethod: async function() {
    await Promise.resolve('hello');
  }
});
