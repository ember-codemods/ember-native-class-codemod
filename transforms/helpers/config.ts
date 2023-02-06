import { getOptions } from 'codemod-cli';
import { cosmiconfigSync } from 'cosmiconfig';
import type { PartialUserOptions, UserOptions } from './options';
import { DEFAULT_OPTIONS, UserOptionsSchema, parseConfig } from './options';

/**
 * Returns a UserOptions object merging options from three sources:
 * - DEFAULT_OPTIONS
 * - a config file (which overrides the above)
 * - ENV variables (which overrides the above)
 */
export default function getConfig(dir = process.cwd()): UserOptions {
  const config = {
    ...DEFAULT_OPTIONS,
    ...getFileConfig(dir),
    ...getCliConfig(),
  };

  return UserOptionsSchema.parse(config);
}

const searchPlaces = [
  'package.json',
  '.codemods.json',
  '.codemods.js',
  '.codemods.cjs',
  '.codemods.yaml',
  '.codemods.yml',
];

function getFileConfig(dir: string): PartialUserOptions {
  const explorer = cosmiconfigSync('codemods', { searchPlaces });
  const result = explorer.search(dir);
  return result ? parseConfig(result.filepath, result.config) : {};
}

function getCliConfig(): PartialUserOptions {
  return parseConfig('CLI', getOptions());
}
