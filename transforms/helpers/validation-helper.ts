import minimatch from 'minimatch';
import type { EOProps } from './eo-prop/index';
import type { Options } from './options';

const TYPE_PATTERNS = {
  service: '**/services/**/*.js',
  services: '**/services/**/*.js',
  controller: '**/controllers/**/*.js',
  controllers: '**/controllers/**/*.js',
  component: '**/components/**/*.js',
  components: '**/components/**/*.js',
  route: '**/routes/**/*.js',
  routes: '**/routes/**/*.js',
} as const;

const TEST_FILE_PATTERN = '**/*-test.js' as const;

/** Returns true if the specified file is a test file */
export function isTestFile(file: string): boolean {
  return minimatch(file, TEST_FILE_PATTERN);
}

/**
 * Returns true if the given path matches the type of ember object
 * The glob patterns are specified by `TYPE_PATTERNS`
 */
export function isFileOfType(file: string, type: Options['type']): boolean {
  return (
    // False positive
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !!type && !!TYPE_PATTERNS[type] && minimatch(file, TYPE_PATTERNS[type])
  );
}

/**
 * Iterates through instance properties to verify if there are any props that
 * can not be transformed
 */
// FIXME: Rename...Make EO class??
export function hasValidProps({ instanceProps }: EOProps): string[] {
  let errors: string[] = [];
  for (const instanceProp of instanceProps) {
    errors = [...errors, ...instanceProp.errors];
  }
  return errors;
}
