import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { setTelemetry } from 'ember-codemods-telemetry-helpers';
import { GlobSync } from 'glob';
import { applyTransform } from 'jscodeshift/dist/testUtils';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import transform, { parser } from '../ember-object/index';
import { assert } from '../helpers/util/types';
import mockTelemetryData from './__testfixtures__/-mock-telemetry.json';

const fixtureDir = 'transforms/ember-object/__testfixtures__/';
const testFiles = new GlobSync(`${fixtureDir}**/*.input.js`).found;

const mockTelemetry: Record<string, unknown> = {};
for (const testFile of testFiles) {
  const moduleName = testFile
    .slice(fixtureDir.length)
    .replace(/\.input\.[^./]+$/, '');
  const value =
    (mockTelemetryData as Record<string, unknown>)[moduleName] ?? {};

  // eslint-disable-next-line unicorn/prefer-module
  mockTelemetry[path.resolve(__dirname, `./__testfixtures__/${moduleName}`)] =
    value;
}

setTelemetry(mockTelemetry);

interface TestCase {
  testName: string;
  testPath: string;
  input: string;
  output: string;
  expectedError: string | undefined;
  skipped: boolean;
  options: string;
}

const testCases = testFiles.map((inputPath): TestCase => {
  const extension = path.extname(inputPath);
  const testName = inputPath
    .slice(fixtureDir.length)
    .replace(`.input${extension}`, '');
  const testPath = path.join(fixtureDir, `${testName}${extension}`);
  const input = readFileSync(inputPath, 'utf8');
  const outputPath = path.join(fixtureDir, `${testName}.output${extension}`);

  const fullOutput = readFileSync(outputPath, 'utf8');
  const parsedOutput =
    /^(?:\/\*\nExpect error:\n(?<expectedError>[\S\s]*)\n\*\/)?(?<content>[\S\s]*)$/.exec(
      fullOutput
    );
  const output = parsedOutput?.groups?.['content'];
  assert(output, `Expected to find file content in ${outputPath}`);
  const expectedError = parsedOutput.groups?.['expectedError'];

  const skipped = fullOutput.startsWith('/* Expect skipped */');

  const optionsPath = path.join(fixtureDir, `${testName}.options.json`);
  const options = existsSync(optionsPath)
    ? readFileSync(optionsPath, 'utf8')
    : '';
  return {
    testName,
    testPath,
    input,
    output,
    expectedError,
    skipped,
    options,
  };
});

describe('ember-object', () => {
  describe.each(testCases)(
    '$testName',
    ({ testPath, input, output, expectedError, skipped, options }) => {
      beforeEach(function () {
        process.env['CODEMOD_CLI_ARGS'] = options;
      });

      afterEach(function () {
        process.env['CODEMOD_CLI_ARGS'] = '';
      });

      test('transforms correctly', function () {
        runTest(testPath, input, output, expectedError, skipped);
      });

      test('is idempotent', function () {
        runTest(testPath, output, output, expectedError, skipped);
      });
    }
  );
});

function runTest(
  testPath: string,
  input: string,
  output: string,
  expectedError: string | undefined,
  skipped: boolean
): void {
  if (expectedError) {
    // IDG why expect().toThrow() doesn't work here but whatever
    let errorCount = 0;
    try {
      runTransform(input, testPath);
    } catch (e: unknown) {
      errorCount++;
      assert(e instanceof Error, 'expected e to be an Error');
      expect(`${e.name}: ${squish(e.message)}`).toEqual(squish(expectedError));
    }
    expect(errorCount).toEqual(1);
  } else if (skipped) {
    expect(runTransform(input, testPath)).toBeUndefined();
  } else {
    expect(runTransform(input, testPath)).toEqual(output.trim());
  }
}

function runTransform(
  input: string,
  testPath: string
): string | null | undefined {
  return applyTransform(
    transform,
    // NOTE: This version of options unused in the transform
    {},
    {
      source: input,
      path: testPath,
    },
    { parser }
  );
}

function squish(str: string): string {
  if (!str) {
    return str;
  }
  return str
    .replace(/^\s+/, '') // remove all space at beginning of string
    .replace(/\s+$/, '') // remove all space at end of string
    .replace(/\u200B/g, '') // remove zero-width spaces
    .replace(/\s+/g, ' '); // squish multiple spaces into one
}
