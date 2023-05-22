import { minimatch } from 'minimatch';
import { TYPES, type Type } from './options';

const TYPE_PATTERNS = Object.fromEntries(
  TYPES.map((type) => [type, `**/${type}/**/*.js`] as const)
) as Record<Type, string>;

const TEST_FILE_PATTERN = '**/*-test.js' as const;

/** Returns true if the specified file is a test file */
export function isTestFile(file: string): boolean {
  return minimatch(file, TEST_FILE_PATTERN);
}

/**
 * Returns true if the given path matches the type of ember object
 * The glob patterns are specified by `TYPE_PATTERNS`
 */
export function isFileOfType(file: string, type: Type): boolean {
  return minimatch(file, TYPE_PATTERNS[type]);
}
