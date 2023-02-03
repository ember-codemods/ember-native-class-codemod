import { getOptions } from 'codemod-cli';
import { cosmiconfigSync } from 'cosmiconfig';
import type { UserOptions } from './options';
import { DEFAULT_OPTIONS } from './options';
import { isRecord, verified } from './util/types';

/**
 * Returns a UserOptions object merging options from three sources:
 * - DEFAULT_OPTIONS
 * - a config file (which overrides the above)
 * - ENV variables (which overrides the above)
 */
export default function getConfig(dir = process.cwd()): UserOptions {
  return {
    ...DEFAULT_OPTIONS,
    ...getFileConfig(dir),
    ...getCliConfig(),
  };
}

const searchPlaces = [
  'package.json',
  '.codemods.json',
  '.codemods.js',
  '.codemods.cjs',
  '.codemods.yaml',
  '.codemods.yml',
];

function getFileConfig(dir: string): Partial<UserOptions> {
  const explorer = cosmiconfigSync('codemods', { searchPlaces });
  const result = explorer.search(dir);
  return result ? verified<Partial<UserOptions>>(result.config, isRecord) : {};
}

function getCliConfig(): Partial<UserOptions> {
  return verified<Partial<UserOptions>>(getOptions(), isRecord);
}
