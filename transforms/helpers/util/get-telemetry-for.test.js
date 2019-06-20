const { getModulePathFor } = require('./get-telemetry-for');

describe('getModulePathFor', () => {
  test('accesses telemetry data for the specified app module', () => {
    const addonPaths = {
      '/User/whomever/voyager-web/lib/invitation-platform': 'invitation-platform',
    };

    expect(
      getModulePathFor(
        '/User/whomever/voyager-web/lib/invitation-platform/addon/components/fuse-limit-alert',
        addonPaths
      )
    ).toEqual('invitation-platform/components/fuse-limit-alert');
  });
});
