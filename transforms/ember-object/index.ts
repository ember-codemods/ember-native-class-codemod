import { getOptions } from 'codemod-cli';
import type { Transform } from 'jscodeshift';
import path from 'path';
import type { Options } from '../helpers/options';
import { DEFAULT_OPTIONS } from '../helpers/options';
import { replaceEmberObjectExpressions } from '../helpers/parse-helper';
import { isRecord, verified } from '../helpers/util/types';

const transformer: Transform = function (file, api) {
  const extension = path.extname(file.path);

  if (!['.js', '.ts'].includes(extension.toLowerCase())) {
    // do nothing on non-js/ts files
    return;
  }

  const j = api.jscodeshift;
  const options = {
    ...DEFAULT_OPTIONS,
    ...verified<Partial<Options>>(getOptions(), isRecord),
  };
  let { source } = file;

  const root = j(source);

  const replaced = replaceEmberObjectExpressions(j, root, file.path, options);
  if (replaced) {
    source = root.toSource({
      quote: options.quotes || options.quote,
    });
  }
  return source;
};

export default transformer;

// Set the parser, needed for supporting decorators
export const parser = 'flow';
