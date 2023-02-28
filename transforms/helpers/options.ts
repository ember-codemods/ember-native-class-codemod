import type { ZodError } from 'zod';
import { z } from 'zod';
import logger from './log-helper';
import type { RuntimeData } from './runtime-data';

const DEFAULT_DECORATOR_CONFIG = {
  inObjectLiterals: [],
};

const DecoratorOptionsSchema = z
  .object({
    /** Allow-list for decorators currently applied to object literal properties that can be safely applied to class properties. */
    inObjectLiterals: z.preprocess((arg: unknown) => {
      return typeof arg === 'string' ? arg.split(/\s*,\s*/) : arg;
    }, z.array(z.string())),
  })
  .partial();

export const UserOptionsSchema = z.object({
  /** Enable/disable transformation using decorators, or pass in DecoratorOptions */
  decorators: z.preprocess((arg: unknown) => {
    return arg === true ? DEFAULT_DECORATOR_CONFIG : arg;
  }, z.union([DecoratorOptionsSchema, z.literal(false)])),
  /** Enable/disable transformation using class fields */
  classFields: z.boolean(),
  /** Enable/disable adding the [`@classic` decorator](https://github.com/pzuraq/ember-classic-decorator), which helps with transitioning Ember Octane */
  classicDecorator: z.boolean(),
  /** If `false`, the entire file will fail validation if any EmberObject within it fails validation. */
  partialTransforms: z.boolean(),
  /** Whether to use double or single quotes by default for new statements that are added during the codemod. */
  quote: z.union([z.literal('single'), z.literal('double')]),
  quotes: z.union([z.literal('single'), z.literal('double')]).optional(),
  /**
   * Allow-list for ObjectExpression or ArrayExpression properties to ignore
   * issues detailed in eslint-plugin-ember/avoid-leaking-state-in-ember-objects.
   */
  ignoreLeakingState: z.array(z.string()),
  /** Apply transformation to only passed type. */
  type: z
    .union([
      z.literal('services'),
      z.literal('routes'),
      z.literal('components'),
      z.literal('controllers'),
    ])
    .optional(),
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
  { message }: ZodError<PartialUserOptions>
): void {
  logger.error(`[${source}]: CONFIG ERROR: \n\t${message}`);
}

interface PrivateOptions {
  /** @private */
  runtimeData: RuntimeData;
}

export type Options = UserOptions & PrivateOptions;

export const DEFAULT_OPTIONS: UserOptions = {
  decorators: DEFAULT_DECORATOR_CONFIG,
  classFields: true,
  classicDecorator: true,
  quote: 'single',
  partialTransforms: true,
  ignoreLeakingState: ['queryParams'],
};
