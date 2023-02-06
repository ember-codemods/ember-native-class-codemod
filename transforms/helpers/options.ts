import type { ZodError } from 'zod';
import { z } from 'zod';
import logger from './log-helper';
import type { RuntimeData } from './runtime-data';

export const UserOptionsSchema = z.object({
  /** Enable/disable transformation using decorators */
  decorators: z.boolean(),
  /** Enable/disable transformation using class fields */
  classFields: z.boolean(),
  /** Enable/disable adding the [`@classic` decorator](https://github.com/pzuraq/ember-classic-decorator), which helps with transitioning Ember Octane */
  classicDecorator: z.boolean(),
  /** Whether to use double or single quotes by default for new statements that are added during the codemod. */
  quote: z.union([z.literal('single'), z.literal('double')]),
  quotes: z.union([z.literal('single'), z.literal('double')]).optional(),
  /** Apply transformation to only passed type. */
  type: z
    .union([
      z.literal('services'),
      z.literal('routes'),
      z.literal('components'),
      z.literal('controllers'),
    ])
    .optional(),
  /** Allow-list for decorators currently applied to object literal properties that can be safely applied to class properties. */
  objectLiteralDecorators: z.preprocess((arg: unknown) => {
    return typeof arg === 'string' ? arg.split(/\s*,\s*/) : arg;
  }, z.array(z.string()).optional()),
});

export type UserOptions = z.infer<typeof UserOptionsSchema>;

const PartialUserOptionsSchema = UserOptionsSchema.partial();

export type PartialUserOptions = z.infer<typeof PartialUserOptionsSchema>;

/**
 * Parses a raw config from a given source to ensure compliance with the
 * PartialUserOptionsSchema.
 *
 * If the raw config does not parse correctly, will log an error message and
 * return an empty config object.
 *
 * @param source Source annotation for error messages.
 * @param raw Raw config.
 */
export function parseConfig(source: string, raw: unknown): PartialUserOptions {
  const parsed = PartialUserOptionsSchema.safeParse(raw);
  let options = {};
  if (parsed.success) {
    options = parsed.data;
  } else {
    logConfigError(source, parsed.error);
    return {};
  }
  return options;
}

function logConfigError(
  source: string,
  { errors }: ZodError<PartialUserOptions>
): void {
  for (const error of errors) {
    const key = Array.isArray(error.path) ? error.path.join('.') : error.path;
    logger.error(
      `[${source}]: CONFIG ERROR key="${key}" message="${error.message}"`
    );
  }
}

export interface PrivateOptions {
  /** @private */
  runtimeData: RuntimeData;
}

export type Options = UserOptions & PrivateOptions;

export const DEFAULT_OPTIONS: UserOptions = {
  decorators: true,
  classFields: true,
  classicDecorator: true,
  quote: 'single',
};
