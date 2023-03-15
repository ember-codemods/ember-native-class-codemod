import type { Transform } from 'jscodeshift';
import { inspect } from 'node:util';
import path from 'path';
import type * as AST from '../helpers/ast';
import getConfig from '../helpers/config';
import logger from '../helpers/log-helper';
import maybeTransformEmberObjects from '../helpers/transform';
import { isFileOfType, isTestFile } from '../helpers/validation-helper';

/**
 * | Result       | How-to                      | Meaning                                            |
 * | :------      | :------                     | :-------                                           |
 * | `errors`     | `throw`                     | we attempted to transform but encountered an error |
 * | `unmodified` | return `string` (unchanged) | we attempted to transform but it was unnecessary   |
 * | `skipped`    | return `undefined`          | we did not attempt to transform                    |
 * | `ok`         | return `string` (changed)   | we successfully transformed                        |
 */
const transformer: Transform = function (
  { source, path: filePath },
  { jscodeshift: j }
) {
  try {
    const extension = path.extname(filePath);
    if (!['.js', '.ts'].includes(extension.toLowerCase())) {
      // do nothing on non-js/ts files
      return; // status: 'skipped'
    }

    if (isTestFile(filePath)) {
      logger.info({ filePath, message: 'SKIPPED: test file' });
      return; // status: 'skipped'
    }

    const userOptions = getConfig();

    if (userOptions.type && !isFileOfType(filePath, userOptions.type)) {
      logger.info({
        filePath,
        message: `SKIPPED: Type mismatch, expected type '${userOptions.type}' did not match type of file`,
      });
      return; // status: 'skipped'
    }

    const root = j(source) as AST.Collection;
    return maybeTransformEmberObjects(root, filePath, userOptions) // might throw --> status: 'errors'
      ? root.toSource({ quote: userOptions.quote }) // status: `ok`
      : source; // status: `unchanged`
  } catch (rawError: unknown) {
    const error =
      rawError instanceof Error
        ? rawError
        : new Error(`Unknown Error: ${inspect(rawError)}`);
    logger.error({ filePath, error });
    throw error; // status: `errors`
  }
};

export default transformer;

// Set the parser, needed for supporting decorators
export { default as parser } from '../helpers/parse';
