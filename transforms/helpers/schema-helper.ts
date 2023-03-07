import { inspect } from 'node:util';
import type { ZodEffects, ZodTypeAny } from 'zod';
import { z } from 'zod';

const preprocessStringToBoolean = <I extends ZodTypeAny>(
  schema: I
): ZodEffects<I, I['_output'], unknown> => {
  return z.preprocess(strictCoerceStringToBoolean, schema);
};

/** Allows true | false | 'true' | 'false' */
export const StringBooleanSchema = preprocessStringToBoolean(z.boolean());

/** Allows false | 'false' */
export const StringFalseSchema = preprocessStringToBoolean(z.literal(false));

function strictCoerceStringToBoolean(arg: unknown): unknown {
  return typeof arg === 'string'
    ? { true: true, false: false }[arg] ?? arg // strictly coerce 'true' and 'false' to true and false
    : arg;
}

/** Allows an array of strings or a comma-separated string */
export const StringArraySchema = z.preprocess(
  (arg: unknown) => {
    return typeof arg === 'string' ? arg.split(/\s*,\s*/) : arg;
  },
  z.array(z.string(), {
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_type) {
        return {
          message: `Expected array of strings or comma-separated string, received ${inspect(
            ctx.data
          )}`,
        };
      }
      return { message: ctx.defaultError };
    },
  })
);
