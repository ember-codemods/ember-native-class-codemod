import { inspect } from 'node:util';
import type { ZodError } from 'zod';
import { z } from 'zod';
import type { RuntimeData } from './runtime-data';
import {
  StringArraySchema,
  StringBooleanSchema,
  StringFalseSchema,
} from './schema-helper';
import { defined, twoOrMoreMap } from './util/types';

const DEFAULT_DECORATOR_CONFIG = {
  inObjectLiterals: [],
};

const DecoratorOptionsSchema = z
  .object({
    inObjectLiterals: StringArraySchema.describe(
      'A list of decorators that are allowed on object literal properties. (Method decorators will always be allowed.) When the codemod finds a field with one of these decorators, it will be translated directly into a class field with the same decorator. Including a decorator in this list means that you believe that the decorator will work correctly on a class field.'
    ),
  })
  .partial();

const DecoratorsSchema = z.preprocess(
  (arg: unknown) => {
    return arg === true || arg === 'true' ? DEFAULT_DECORATOR_CONFIG : arg;
  },
  z.union([DecoratorOptionsSchema, StringFalseSchema], {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_union) {
        return {
          message: `Expected DecoratorOptions object or boolean, received ${inspect(
            ctx.data
          )}`,
        };
      }
      return { message: ctx.defaultError };
    },
  })
);

const QuoteSchema = z.union([z.literal('single'), z.literal('double')], {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_union) {
      return {
        message: `Expected 'single' or 'double', received ${inspect(ctx.data)}`,
      };
    }
    return { message: ctx.defaultError };
  },
});

export const TYPES = [
  'adapters',
  'components',
  'controllers',
  'helpers',
  'routes',
  'services',
] as const;

export type Type = (typeof TYPES)[number];

const TypeSchema = z.union(
  twoOrMoreMap(TYPES, (type) => z.literal(type)),
  {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_union) {
        const formattedTypes = TYPES.map((type) => `'${type}'`);
        const expected = `${formattedTypes
          .slice(0, -1)
          .join(', ')}, or ${defined(
          formattedTypes[formattedTypes.length - 1]
        )}`;
        return {
          message: `Expected ${expected}, received ${inspect(ctx.data)}`,
        };
      }
      return { message: ctx.defaultError };
    },
  }
);

export const UserOptionsSchema = z.object({
  decorators: DecoratorsSchema.describe(
    'Enable/disable transformation using decorators, or pass in DecoratorOptions'
  ),
  classFields: StringBooleanSchema.describe(
    'Enable/disable transformation using class fields'
  ),
  classicDecorator: StringBooleanSchema.describe(
    'Enable/disable adding the [`@classic` decorator](https://github.com/pzuraq/ember-classic-decorator), which helps with transitioning Ember Octane'
  ),
  quote: QuoteSchema.describe(
    'Whether to use double or single quotes by default for new statements that are added during the codemod.'
  ),
  ignoreLeakingState: StringArraySchema.describe(
    'Allow-list for ObjectExpression or ArrayExpression properties to ignore issues detailed in eslint-plugin-ember/avoid-leaking-state-in-ember-objects.'
  ),
  type: TypeSchema.describe(
    'Apply transformation to only passed type.'
  ).optional(),
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
  error: ZodError<PartialUserOptions>
): void {
  const flattened = error.flatten();
  const errors = flattened.formErrors;
  for (const [key, value] of Object.entries(flattened.fieldErrors)) {
    errors.push(`[${key}] ${value.join('; ')}`);
  }
  const message = errors.join('\n\t');
  throw new ConfigError(`${source} Config Error\n\t${message}`);
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
  ignoreLeakingState: ['queryParams'],
};

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}
