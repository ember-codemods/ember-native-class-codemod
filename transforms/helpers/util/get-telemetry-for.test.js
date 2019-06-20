const { getModulePathFor } = require('./get-telemetry-for');

describe('getModulePathFor', () => {
  const addonPaths = {
    '/User/whomever/some-app/lib/special-sauce': 'special-sauce',
  };

  const appPaths = {
    '/User/whomever/some-app': 'some-app',
  };

  test('can determine the runtime module id for a specific on disk in-repo addon file', () => {
    expect(
      getModulePathFor(
        '/User/whomever/some-app/lib/special-sauce/addon/components/fire-sauce.js',
        addonPaths,
        appPaths
      )
    ).toEqual('special-sauce/components/fire-sauce');

    expect(
      getModulePathFor(
        '/User/whomever/some-app/lib/special-sauce/addon-test-support/services/whatever.js',
        addonPaths,
        appPaths
      )
    ).toEqual('special-sauce/test-support/services/whatever');
  });

  test("does not process files in an in-repo addon's app/ folder", () => {
    expect(
      getModulePathFor(
        '/User/whomever/some-app/lib/special-sauce/app/services/whatever.js',
        addonPaths,
        appPaths
      )
    ).toEqual(undefined);
  });

  test('can determine the runtime module id for a file in the app itself', () => {
    expect(
      getModulePathFor(
        '/User/whomever/some-app/app/services/something-here.js',
        addonPaths,
        appPaths
      )
    ).toEqual('some-app/services/something-here');

    expect(
      getModulePathFor(
        '/User/whomever/some-app/tests/mocks/something-here.js',
        addonPaths,
        appPaths
      )
    ).toEqual('some-app/tests/mocks/something-here');
  });
});
