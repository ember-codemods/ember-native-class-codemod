import { default as j } from 'jscodeshift';
import type * as AST from '../../../ast';
import { replaceComputedSuperExpressions as replaceComputedSuperExpression } from '../../../transform-helper';
import { assert, defined } from '../../../util/types';
import AbstractEOCallExpressionProp from './abstract';

export default class EOComputedFunctionExpressionProp extends AbstractEOCallExpressionProp<AST.ClassMethod> {
  build(): AST.ClassMethod {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'FunctionExpression',
      'expected lastArg to be a FunctionExpression'
    );
    return replaceComputedSuperExpression(
      j.classMethod.from({
        kind: defined(this.kind),
        key: this.key,
        params: lastArg.params,
        body: lastArg.body,
        comments: this.comments,
        decorators: this.buildDecorators(),
      }),
      this.replaceSuperWithUndefined,
      this.key
    );
  }
}
