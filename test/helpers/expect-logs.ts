import { expect, jest } from '@jest/globals';
import logger from '../../transforms/helpers/log-helper';

/**
 * Spies on all logger log levels for messages matching those passed in the
 * config.
 *
 * @param callback The callback expected to trigger (or not) the logs.
 * @param config An optional object with an array of expected messages for each
 * log level. If no array is passed, no messages will be expected for that
 * level. If no object is passed, the function will expect that there are no
 * logs.
 */
export function expectLogs(
  callback: () => void,
  {
    info = [],
    warn = [],
    error = [],
  }: {
    info?: string[];
    warn?: string[];
    error?: string[];
  } = {}
): void {
  const infoConfig = {
    level: 'info' as const,
    expectedMessages: info,
    restoreAllMocks: false,
  };
  const warnConfig = {
    level: 'warn' as const,
    expectedMessages: warn,
    restoreAllMocks: false,
  };
  const errorConfig = {
    level: 'error' as const,
    expectedMessages: error,
    restoreAllMocks: true,
  };

  expectLogLevel(() => {
    expectLogLevel(() => {
      expectLogLevel(callback, infoConfig);
    }, warnConfig);
  }, errorConfig);

  jest.restoreAllMocks();
}

/**
 * Spies on the logger for messages matching those passed in the config.
 *
 * @param callback The callback expected to trigger (or not) the logs.
 * @param config An optional object with an specified log `level`, an array of
 * `expectedMessages` for that log level, and an option to run
 * `jest.restoreAllMocks()` after the callback and expectations are complete.
 * If no object is passed, will default to spying on the `'error'` log level,
 * expect that no messages are sent, and will restore all mocks after the test.
 */
function expectLogLevel(
  callback: () => void,
  {
    level = 'error',
    expectedMessages = [],
    restoreAllMocks = true,
  }: {
    level?: 'info' | 'warn' | 'error';
    expectedMessages?: string[];
    restoreAllMocks?: boolean;
  } = {}
): void {
  const spy = jest.spyOn(logger, level);

  callback();

  if (expectedMessages.length > 0) {
    expect(spy).toHaveBeenCalledTimes(expectedMessages.length);
    for (const [index, expectedError] of expectedMessages.entries()) {
      expect(spy).toHaveBeenNthCalledWith(
        index + 1,
        expect.stringMatching(expectedError)
      );
    }
  } else {
    expect(spy).not.toHaveBeenCalled();
  }

  if (restoreAllMocks) {
    jest.restoreAllMocks();
  }
}

/**
 * Makes a regexp pattern to match logs. String arguments passed to
 * `makeLogMatcher` will be escaped then merged together into a regexp that will
 * match partial lines of multi-line logs when paired with Jest
 * `expect.stringMatching`.
 *
 * @example
 * ```
 * const expected = makeLogMatcher('Line 1', 'Line 2', '3')
 * //=> 'Line 1[\S\s]*Line 2[\S\s]*3'
 *
 * expect('Line 1\nLine 2\nLine 3').toEqual(expect.stringMatching(expected));
 * //=> passes
 * ```
 */
export function makeLogMatcher(...parts: string[]): string {
  return parts.map(escapeRegExp).join('[\\S\\s]*');
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
function escapeRegExp(string: string): string {
  return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&'); // $& means the whole matched string
}
