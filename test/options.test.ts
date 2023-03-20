import { describe, expect, test } from '@jest/globals';
import { DEFAULT_OPTIONS, parseConfig } from '../transforms/helpers/options';
import { makeLogMatcher } from './helpers/expect-logs';

describe('options', () => {
  describe('parseConfig', () => {
    test('it parses an empty config', () => {
      const config = parseConfig('test', {});
      expect(config).toStrictEqual({});
    });

    test('it parses the DEFAULT_OPTIONS', () => {
      const config = parseConfig('test', DEFAULT_OPTIONS);
      expect(config).toStrictEqual(DEFAULT_OPTIONS);
    });

    describe('decorators', () => {
      test('it parses `{ decorators: true }`', () => {
        const config = parseConfig('test', { decorators: true });
        expect(config).toStrictEqual({
          decorators: { inObjectLiterals: [] },
        });
      });

      test('it parses `{ decorators: "true" }`', () => {
        const config = parseConfig('test', { decorators: 'true' });
        expect(config).toStrictEqual({
          decorators: { inObjectLiterals: [] },
        });
      });

      test('it parses `{ decorators: false }`', () => {
        const config = parseConfig('test', { decorators: false });
        expect(config).toStrictEqual({ decorators: false });
      });

      test('it parses `{ decorators: "false" }`', () => {
        const config = parseConfig('test', { decorators: 'false' });
        expect(config).toStrictEqual({ decorators: false });
      });

      test('it parses DecoratorOptions.inObjectLiterals with array of strings', () => {
        const config = parseConfig('test', {
          decorators: { inObjectLiterals: ['one', 'two', 'three'] },
        });
        expect(config).toStrictEqual({
          decorators: { inObjectLiterals: ['one', 'two', 'three'] },
        });
      });

      test('it parses DecoratorOptions.inObjectLiterals with string of strings', () => {
        const config = parseConfig('test', {
          decorators: { inObjectLiterals: 'one,two  , three' },
        });
        expect(config).toStrictEqual({
          decorators: { inObjectLiterals: ['one', 'two', 'three'] },
        });
      });

      test('it errors for invalid `decorators` config', () => {
        expect(() => parseConfig('test', { decorators: 'oops' })).toThrow(
          new RegExp(
            makeLogMatcher(
              'test Config Error',
              "[decorators] Expected DecoratorOptions object or boolean, received 'oops'"
            )
          )
        );
      });
    });

    describe.each(['classFields', 'classicDecorator'])(
      '%s (StringBooleanSchema)',
      (fieldName) => {
        test(`it parses \`{ ${fieldName}: true }\``, () => {
          const config = parseConfig('test', { [fieldName]: true });
          expect(config).toStrictEqual({ [fieldName]: true });
        });

        test(`it parses \`{ ${fieldName}: "true" }\``, () => {
          const config = parseConfig('test', { [fieldName]: 'true' });
          expect(config).toStrictEqual({ [fieldName]: true });
        });

        test(`it parses \`{ ${fieldName}: false }\``, () => {
          const config = parseConfig('test', { [fieldName]: false });
          expect(config).toStrictEqual({ [fieldName]: false });
        });

        test(`it parses \`{ ${fieldName}: "false" }\``, () => {
          const config = parseConfig('test', { [fieldName]: 'false' });
          expect(config).toStrictEqual({ [fieldName]: false });
        });

        test(`it errors for invalid \`${fieldName}\` config`, () => {
          expect(() => parseConfig('test', { [fieldName]: 'oops' })).toThrow(
            new RegExp(
              makeLogMatcher(
                'test Config Error',
                `[${fieldName}] Expected boolean, received string`
              )
            )
          );
        });
      }
    );

    describe('quote', () => {
      test('it parses `{ quote: "single" }`', () => {
        const config = parseConfig('test', { quote: 'single' });
        expect(config).toStrictEqual({ quote: 'single' });
      });

      test('it parses `{ quote: "double" }`', () => {
        const config = parseConfig('test', { quote: 'double' });
        expect(config).toStrictEqual({ quote: 'double' });
      });

      test('it errors for invalid `quote` config', () => {
        expect(() => parseConfig('test', { quote: 'oops' })).toThrow(
          new RegExp(
            makeLogMatcher(
              'test Config Error',
              "[quote] Expected 'single' or 'double', received 'oops"
            )
          )
        );
      });
    });

    describe('ignoreLeakingState', () => {
      test('it parses `ignoreLeakingState` with an empty array', () => {
        const config = parseConfig('test', { ignoreLeakingState: [] });
        expect(config).toStrictEqual({ ignoreLeakingState: [] });
      });

      test('it parses `ignoreLeakingState` with array of strings', () => {
        const config = parseConfig('test', {
          ignoreLeakingState: ['one', 'two', 'three'],
        });
        expect(config).toStrictEqual({
          ignoreLeakingState: ['one', 'two', 'three'],
        });
      });

      test('it parses `ignoreLeakingState` with string of strings', () => {
        const config = parseConfig('test', {
          ignoreLeakingState: 'one,two  , three',
        });
        expect(config).toStrictEqual({
          ignoreLeakingState: ['one', 'two', 'three'],
        });
      });

      test('it errors for invalid `ignoreLeakingState` config', () => {
        expect(() =>
          parseConfig('test', { ignoreLeakingState: false })
        ).toThrow(
          new RegExp(
            makeLogMatcher(
              'test Config Error',
              '[ignoreLeakingState] Expected array of strings or comma-separated string, received false'
            )
          )
        );
      });
    });

    describe('type', () => {
      test.each(['services', 'routes', 'components', 'controllers'])(
        'it parses `{ type: "%s" }`',
        (type) => {
          const config = parseConfig('test', { type });
          expect(config).toStrictEqual({ type });
        }
      );

      test('it errors for invalid `type` config', () => {
        expect(() => parseConfig('test', { type: 'oops' })).toThrow(
          new RegExp(
            makeLogMatcher(
              'test Config Error',
              "[type] Expected 'services', 'routes', 'components', or 'controllers', received 'oops"
            )
          )
        );
      });
    });
  });
});
