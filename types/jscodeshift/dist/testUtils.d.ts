import type { FileInfo, Options, Parser, Transform } from 'jscodeshift';

declare module 'jscodeshift/dist/testUtils' {
  export function applyTransform(
    transform: Transform,
    transformOptions: Options,
    fileInfo: FileInfo,
    testOptions?: { parser: Parser }
  ): string | null | undefined;
}
