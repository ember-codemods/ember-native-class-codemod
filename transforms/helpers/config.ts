import { getOptions } from 'codemod-cli';
import { cosmiconfigSync } from 'cosmiconfig';
import type { UserOptions } from './options';
import { DEFAULT_OPTIONS } from './options';
import { isRecord, verified } from './util/types';

/**
 * FIXME: document
 */
export default function getConfig(): UserOptions {
  return {
    ...DEFAULT_OPTIONS,
    ...getFileConfig(),
    ...getCliConfig(),
  };
}

function getFileConfig(): Partial<UserOptions> {
  // FIXME: Look into options
  const explorer = cosmiconfigSync('codemods');
  const result = explorer.search();
  return result ? verified<Partial<UserOptions>>(result.config, isRecord) : {};
}

function getCliConfig(): Partial<UserOptions> {
  return verified<Partial<UserOptions>>(getOptions(), isRecord);
}
