/*
Expect error:
  ValidationError: Validation errors for class 'Foo4':
    [methodish]: Transform not supported - decorator '@userAdded' not included in ALLOWED_OBJECT_LITERAL_DECORATORS or option '--objectLiteralDecorators'
*/

// Do not transform function expression if not on allowlist
const Foo4 = EmberObject.extend({
  @userAdded methodish: () => {},
});