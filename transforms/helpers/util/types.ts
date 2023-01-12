export type AnyObject<T = unknown> = Record<PropertyKey, T>;

/** Checks if the given value is a `Record<string, unknown>`. */
export function isRecord<R extends Record<string, unknown>>(value: unknown): value is R {
  return value !== null && typeof value === 'object';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function assert(condition: unknown, message = 'Assertion Error'): asserts condition {
  if (!condition) {
    throw Error(message);
  }
}

export function verified<T>(
  value: unknown,
  condition: (value: unknown) => value is T,
  message = condition.name ? `Verification Error: ${condition.name}` : 'Verification Error'
): T {
  assert(condition(value), message);
  return value as T;
}

export type JsonValue = string | boolean | number | null | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export interface JsonObject extends Record<string, JsonValue> {}
