/**
 * Makes a regexp pattern to match multiline strings. String arguments passed to
 * `makeMultilineMatcher` will be escaped then merged together into a regexp
 * that will match partial lines of multi-line error messages when paired with
 * Jest `expect().toThrow` or `expect.stringMatching`.
 *
 * @example
 * ```
 * const expected = makeMultilineMatcher('Line 1', 'Line 2', '3')
 * //=> 'Line 1[\S\s]*Line 2[\S\s]*3'
 *
 * expect('Line 1\nLine 2\nLine 3').toEqual(expect.stringMatching(expected));
 * //=> passes
 * ```
 */
export function makeMultilineMatcher(...parts: string[]): string {
  return parts.map(escapeRegExp).join('[\\S\\s]*');
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
function escapeRegExp(string: string): string {
  return string.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&'); // $& means the whole matched string
}
