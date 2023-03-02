import { describe, expect, test } from '@jest/globals';
import { DEFAULT_OPTIONS, parseConfig } from '../transforms/helpers/options';
import { expectLogs, makeLogMatcher } from './helpers/expect-logs';

describe('options', () => {
  describe('parseConfig', () => {
    test('it parses an empty config', () => {
      expectLogs(() => {
        const config = parseConfig('test', {});
        expect(config).toStrictEqual({});
      });
    });

    test('it parses the DEFAULT_OPTIONS', () => {
      expectLogs(() => {
        const config = parseConfig('test', DEFAULT_OPTIONS);
        expect(config).toStrictEqual(DEFAULT_OPTIONS);
      });
    });

    describe('decorators', () => {
      test('it parses `{ decorators: true }`', () => {
        expectLogs(() => {
          const config = parseConfig('test', { decorators: true });
          expect(config).toStrictEqual({
            decorators: { inObjectLiterals: [] },
          });
        });
      });

      test('it parses `{ decorators: "true" }`', () => {
        expectLogs(() => {
          const config = parseConfig('test', { decorators: 'true' });
          expect(config).toStrictEqual({
            decorators: { inObjectLiterals: [] },
          });
        });
      });

      test('it parses `{ decorators: false }`', () => {
        expectLogs(() => {
          const config = parseConfig('test', { decorators: false });
          expect(config).toStrictEqual({ decorators: false });
        });
      });

      test('it parses `{ decorators: "false" }`', () => {
        expectLogs(() => {
          const config = parseConfig('test', { decorators: 'false' });
          expect(config).toStrictEqual({ decorators: false });
        });
      });

      test('it parses DecoratorOptions.inObjectLiterals with array of strings', () => {
        expectLogs(() => {
          const config = parseConfig('test', {
            decorators: { inObjectLiterals: ['one', 'two', 'three'] },
          });
          expect(config).toStrictEqual({
            decorators: { inObjectLiterals: ['one', 'two', 'three'] },
          });
        });
      });

      test('it parses DecoratorOptions.inObjectLiterals with string of strings', () => {
        expectLogs(() => {
          const config = parseConfig('test', {
            decorators: { inObjectLiterals: 'one,two  , three' },
          });
          expect(config).toStrictEqual({
            decorators: { inObjectLiterals: ['one', 'two', 'three'] },
          });
        });
      });

      test('it logs an error for invalid `decorators` config', () => {
        expectLogs(
          () => {
            const config = parseConfig('test', { decorators: 'oops' });
            expect(config).toStrictEqual({});
          },
          {
            error: [
              makeLogMatcher(
                '[test]: CONFIG ERROR:',
                "[decorators] Expected DecoratorOptions object or boolean, received 'oops'"
              ),
            ],
          }
        );
      });
    });

    describe.each(['classFields', 'classicDecorator', 'partialTransforms'])(
      '%s (StringBooleanSchema)',
      (fieldName) => {
        test(`it parses \`{ ${fieldName}: true }\``, () => {
          expectLogs(() => {
            const config = parseConfig('test', { [fieldName]: true });
            expect(config).toStrictEqual({ [fieldName]: true });
          });
        });

        test(`it parses \`{ ${fieldName}: "true" }\``, () => {
          expectLogs(() => {
            const config = parseConfig('test', { [fieldName]: 'true' });
            expect(config).toStrictEqual({ [fieldName]: true });
          });
        });

        test(`it parses \`{ ${fieldName}: false }\``, () => {
          expectLogs(() => {
            const config = parseConfig('test', { [fieldName]: false });
            expect(config).toStrictEqual({ [fieldName]: false });
          });
        });

        test(`it parses \`{ ${fieldName}: "false" }\``, () => {
          expectLogs(() => {
            const config = parseConfig('test', { [fieldName]: 'false' });
            expect(config).toStrictEqual({ [fieldName]: false });
          });
        });

        test(`it logs an error for invalid \`${fieldName}\` config`, () => {
          expectLogs(
            () => {
              const config = parseConfig('test', { [fieldName]: 'oops' });
              expect(config).toStrictEqual({});
            },
            {
              error: [
                makeLogMatcher(
                  '[test]: CONFIG ERROR:',
                  `[${fieldName}] Expected boolean, received string`
                ),
              ],
            }
          );
        });
      }
    );

    describe('quote', () => {
      test('it parses `{ quote: "single" }`', () => {
        expectLogs(() => {
          const config = parseConfig('test', { quote: 'single' });
          expect(config).toStrictEqual({ quote: 'single' });
        });
      });

      test('it parses `{ quote: "double" }`', () => {
        expectLogs(() => {
          const config = parseConfig('test', { quote: 'double' });
          expect(config).toStrictEqual({ quote: 'double' });
        });
      });

      test('it logs an error for invalid `quote` config', () => {
        expectLogs(
          () => {
            const config = parseConfig('test', { quote: 'oops' });
            expect(config).toStrictEqual({});
          },
          {
            error: [
              makeLogMatcher(
                '[test]: CONFIG ERROR:',
                "[quote] Expected 'single' or 'double', received 'oops"
              ),
            ],
          }
        );
      });
    });

    describe('ignoreLeakingState', () => {
      test('it parses `ignoreLeakingState` with an empty array', () => {
        expectLogs(() => {
          const config = parseConfig('test', { ignoreLeakingState: [] });
          expect(config).toStrictEqual({ ignoreLeakingState: [] });
        });
      });

      test('it parses `ignoreLeakingState` with array of strings', () => {
        expectLogs(() => {
          const config = parseConfig('test', {
            ignoreLeakingState: ['one', 'two', 'three'],
          });
          expect(config).toStrictEqual({
            ignoreLeakingState: ['one', 'two', 'three'],
          });
        });
      });

      test('it parses `ignoreLeakingState` with string of strings', () => {
        expectLogs(() => {
          const config = parseConfig('test', {
            ignoreLeakingState: 'one,two  , three',
          });
          expect(config).toStrictEqual({
            ignoreLeakingState: ['one', 'two', 'three'],
          });
        });
      });

      test('it logs an error for invalid `ignoreLeakingState` config', () => {
        expectLogs(
          () => {
            const config = parseConfig('test', { ignoreLeakingState: false });
            expect(config).toStrictEqual({});
          },
          {
            error: [
              makeLogMatcher(
                '[test]: CONFIG ERROR:',
                '[ignoreLeakingState] Expected array of strings or comma-separated string, received false'
              ),
            ],
          }
        );
      });
    });

    describe('type', () => {
      test.each(['services', 'routes', 'components', 'controllers'])(
        'it parses `{ type: "%s" }`',
        (type) => {
          expectLogs(() => {
            const config = parseConfig('test', { type });
            expect(config).toStrictEqual({ type });
          });
        }
      );

      test('it logs an error for invalid `type` config', () => {
        expectLogs(
          () => {
            const config = parseConfig('test', { type: 'oops' });
            expect(config).toStrictEqual({});
          },
          {
            error: [
              makeLogMatcher(
                '[test]: CONFIG ERROR:',
                "[type] Expected 'services', 'routes', 'components', or 'controllers', received 'oops"
              ),
            ],
          }
        );
      });
    });
  });
});
