import { getOptions } from 'codemod-cli';
import type { Transform } from 'jscodeshift';
import path from 'path';
import type { UserOptions } from '../helpers/options';
import { DEFAULT_OPTIONS } from '../helpers/options';
import maybeTransformEmberObjects from '../helpers/transform';
import { isRecord, verified } from '../helpers/util/types';

const transformer: Transform = function (
  { source, path: filePath },
  { jscodeshift: j }
) {
  const extension = path.extname(filePath);
  if (!['.js', '.ts'].includes(extension.toLowerCase())) {
    // do nothing on non-js/ts files
    return;
  }

  const userOptions: UserOptions = {
    ...DEFAULT_OPTIONS,
    ...verified<Partial<UserOptions>>(getOptions(), isRecord),
  };
  const root = j(source);
  const replaced = maybeTransformEmberObjects(j, root, filePath, userOptions);

  if (replaced) {
    source = root.toSource({
      quote: userOptions.quotes ?? userOptions.quote,
    });
  }

  return source;
};

export default transformer;

// Set the parser, needed for supporting decorators
export { default as parser } from '../helpers/parse';
