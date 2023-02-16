import { describe, expect, test } from '@jest/globals';
import path from 'path';
import getConfig, { mergeConfig } from '../../transforms/helpers/config';
import { DEFAULT_OPTIONS } from '../../transforms/helpers/options';

describe('config', () => {
  describe('getConfig', () => {
    test('it has default options', () => {
      const config = getConfig();
      expect(config).toStrictEqual(DEFAULT_OPTIONS);
    });

    test.each(['json', 'js', 'cjs', 'yml', 'yaml', 'package'])(
      'should read %s config',
      (fixture) => {
        const config = getConfig(pathFor(fixture));
        expect(config).toStrictEqual(
          mergeConfig(DEFAULT_OPTIONS, {
            classFields: false,
            quote: 'double',
            decorators: {
              inObjectLiterals: [`${fixture}DecOne`, `${fixture}DecTwo`],
            },
          })
        );
      }
    );
  });

  describe('mergeConfig', () => {
    test('it allows overwriting the ignoreLeakingState config', () => {
      expect(
        mergeConfig(DEFAULT_OPTIONS, {
          ignoreLeakingState: ['queryParams', 'ignoreMyLeakyState'],
        })
      ).toStrictEqual({
        ...DEFAULT_OPTIONS,
        ignoreLeakingState: ['queryParams', 'ignoreMyLeakyState'],
      });
    });

    test('it deep merges the decorators config', () => {
      expect(
        mergeConfig(DEFAULT_OPTIONS, {
          decorators: {
            inObjectLiterals: ['computer'],
          },
        })
      ).toStrictEqual({
        ...DEFAULT_OPTIONS,
        decorators: {
          inObjectLiterals: ['computer'],
        },
      });
    });
  });
});

function pathFor(extension: string): string {
  // eslint-disable-next-line unicorn/prefer-module
  return path.resolve(__dirname, `./fixtures/${extension}`);
}
