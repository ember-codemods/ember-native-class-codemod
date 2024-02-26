import { getOptions } from 'codemod-cli';
import { cosmiconfigSync } from 'cosmiconfig';
import { deepmergeCustom } from 'deepmerge-ts';
import type { PartialUserOptions, UserOptions } from './options';
import { DEFAULT_OPTIONS, UserOptionsSchema, parseConfig } from './options';

export const mergeConfig = deepmergeCustom({
  mergeArrays: (values, _utils, _meta) => {
    return values[values.length - 1]; // overwrite with the last provided array
  },
});

/**
 * Returns a UserOptions object merging options from three sources:
 * - DEFAULT_OPTIONS
 * - a config file (which overrides the above)
 * - ENV variables (which overrides the above)
 */
export default function getConfig(dir = process.cwd()): UserOptions {
  const config = mergeConfig(
    DEFAULT_OPTIONS,
    getFileConfig(dir),
    getCliConfig()
  );
  if (process.env['NO_TELEMETRY'] === 'true') {
    config.noTelemetry = true;
  }
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
