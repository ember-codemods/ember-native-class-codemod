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

const OUTPUT_PARSER =
  /^(?:\/\*\nExpect error:\n(?<expectedError>[\S\s]*)\n\*\/)?(?<content>[\S\s]*)$/;

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
  outputWithNoTelemetry: string;
  expectedError: string | undefined;
  expectedErrorWithNoTelemetry: string | undefined;
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
  const outputWithNoTelemetryPath = path.join(
    fixtureDir,
    `${testName}.output-no-telemetry${extension}`
  );

  const { fullOutput, output, expectedError } = parseOutput(outputPath);

  const skipped = fullOutput.startsWith('/* Expect skipped */');

  let outputWithNoTelemetry;
  let expectedErrorWithNoTelemetry;
  if (existsSync(outputWithNoTelemetryPath)) {
    ({
      output: outputWithNoTelemetry,
      expectedError: expectedErrorWithNoTelemetry,
    } = parseOutput(outputWithNoTelemetryPath));
  } else {
    outputWithNoTelemetry = output;
    expectedErrorWithNoTelemetry = expectedError;
  }

  const optionsPath = path.join(fixtureDir, `${testName}.options.json`);
  const options = existsSync(optionsPath)
    ? readFileSync(optionsPath, 'utf8')
    : '';
  return {
    testName,
    testPath,
    input,
    output,
    outputWithNoTelemetry,
    expectedError,
    expectedErrorWithNoTelemetry,
    skipped,
    options,
  };
});

describe('ember-object', () => {
  describe.each(testCases)(
    '$testName',
    ({
      testPath,
      input,
      output,
      outputWithNoTelemetry,
      expectedError,
      expectedErrorWithNoTelemetry,
      skipped,
      options,
    }) => {
      const parsedOptions = options
        ? (JSON.parse(options) as Record<string, unknown>)
        : {};

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

      // NOTE: To skip testing an input file in no telemetry file, make an
      // options file with `{ "noTelemetry": "false" }`
      if (parsedOptions['noTelemetry'] === undefined) {
        describe('NO_TELEMETRY', function () {
          beforeEach(function () {
            process.env['CODEMOD_CLI_ARGS'] = JSON.stringify({
              noTelemetry: true,
              ...parsedOptions,
            });
          });

          test('transforms correctly', function () {
            runTest(
              testPath,
              input,
              outputWithNoTelemetry,
              expectedErrorWithNoTelemetry,
              skipped
            );
          });

          // FIXME: is idempotent
        });
      }
    }
  );
});

function parseOutput(outputPath: string): {
  fullOutput: string;
  output: string;
  expectedError: string | undefined;
} {
  const fullOutput = readFileSync(outputPath, 'utf8');
  const parsedOutput = OUTPUT_PARSER.exec(fullOutput);
  const output = parsedOutput?.groups?.['content'];
  assert(output, `Expected to find file content in ${outputPath}`);
  const expectedError = parsedOutput.groups?.['expectedError'];
  return { fullOutput, output, expectedError };
}

function runTest(
  testPath: string,
  input: string,
  output: string,
  expectedError: string | undefined,
  skipped: boolean
): void {
  let error: unknown = null;
  let result: string | null | undefined;

  try {
    result = runTransform(input, testPath);
  } catch (e: unknown) {
    error = e;
  }

  if (expectedError) {
    expect(result).toBeUndefined();
    assert(error instanceof Error, 'expected e to be an Error');
    expect(`${error.name}: ${squish(error.message)}`).toEqual(
      squish(expectedError)
    );
  } else if (skipped) {
    expect(error).toBeNull();
    expect(result).toEqual(''); // applyTransform coerces undefined to ''
  } else {
    expect(error).toBeNull();
    expect(result).toEqual(output.trim());
  }
}

function runTransform(input: string, testPath: string): string {
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
