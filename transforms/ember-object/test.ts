import { runTransformTest } from 'codemod-cli';
import { setTelemetry } from 'ember-codemods-telemetry-helpers';
import { globSync } from 'glob';
import path from 'path';

// bootstrap the mock telemetry data
import mockTelemetryData from './__testfixtures__/-mock-telemetry.json';

const testFiles = globSync(
  './transforms/ember-object/__testfixtures__/**/*.input.js'
);
const mockTelemetry: Record<string, unknown> = {};

for (const testFile of testFiles) {
  const moduleName = testFile.replace(/\.input\.[^./]+$/, '');
  const value =
    (mockTelemetryData as Record<string, unknown>)[moduleName] ?? {};

  // eslint-disable-next-line unicorn/prefer-module
  mockTelemetry[path.resolve(__dirname, `./__testfixtures__/${moduleName}`)] =
    value;
}

setTelemetry(mockTelemetry);

runTransformTest({
  type: 'jscodeshift',
  name: 'ember-object',
});
