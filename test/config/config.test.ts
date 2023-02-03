import { describe, expect, test } from '@jest/globals';
import path from 'path';
import getConfig from '../../transforms/helpers/config';
import { DEFAULT_OPTIONS } from '../../transforms/helpers/options';

describe('config', () => {
  test('it has default options', () => {
    const config = getConfig();
    expect(config).toStrictEqual(DEFAULT_OPTIONS);
  });

  test.each(['json', 'js', 'cjs', 'yml', 'yaml', 'package'])(
    'should read %s config',
    (fixture) => {
      const config = getConfig(pathFor(fixture));
      expect(config).toStrictEqual({
        ...DEFAULT_OPTIONS,
        classFields: false,
        quote: 'double',
        objectLiteralDecorators: [`${fixture}DecOne`, `${fixture}DecTwo`],
      });
    }
  );
});

function pathFor(extension: string): string {
  // eslint-disable-next-line unicorn/prefer-module
  return path.resolve(__dirname, `./fixtures/${extension}`);
}
