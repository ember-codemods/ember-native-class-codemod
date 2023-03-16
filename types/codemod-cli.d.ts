declare module 'codemod-cli' {
  export function getOptions(): unknown;
  export function runTransformTest(options: Record<string, unknown>): unknown;
}
