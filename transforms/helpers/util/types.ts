/** Type predicate. Checks if the given value is a `Record<string, unknown>`. */
export function isRecord<R extends Record<string, unknown>>(
  value: unknown
): value is R {
  return value !== null && typeof value === 'object';
}

/** Type predicate. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Assertion function. Throws if the given condition is falsy */
export function assert(
  condition: unknown,
  message = 'Assertion Error'
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/** Asserts that the given value matches the given condition before returning it. */
export function verified<T>(
  value: unknown,
  condition: (value: unknown) => value is T,
  message = condition.name
    ? `Verification Error: ${condition.name}`
    : 'Verification Error'
): T {
  assert(condition(value), message);
  return value;
}

/** Asserts that the given value is defined before returning it. */
export function defined<T>(
  value: T | undefined,
  message = 'Assert Exists Error'
): T {
  assert(value !== undefined, message);
  return value;
}

/**
 * Wraps Array.map in a type-check that the initial array has at least two
 * items, then returns an array asserting that it has the same number of items.
 */
export function twoOrMoreMap<T, U>(
  array: readonly [T, T, ...T[]],
  callbackfn: (value: T, index: number, array: readonly T[]) => U
): [U, U, ...U[]] {
  return array.map(callbackfn) as unknown as [U, U, ...U[]];
}
