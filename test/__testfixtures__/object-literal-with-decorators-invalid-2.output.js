/*
Expect error:
  ValidationError: Validation errors for class 'Foo2':
    [prop]: Transform not supported - decorator '@banned' not included in ALLOWED_OBJECT_LITERAL_DECORATORS or option '--objectLiteralDecorators'
*/

// Do not transform if not on allowlist
const Foo2 = EmberObject.extend({
  @banned prop: '',
});
