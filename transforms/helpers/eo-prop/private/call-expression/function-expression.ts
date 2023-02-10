import { default as j } from 'jscodeshift';
import type { ClassMethod } from '../../../ast';
import { replaceSuperExpressions } from '../../../transform-helper';
import { assert, defined } from '../../../util/types';
import AbstractEOCallExpressionProp from './abstract';

export default class EOComputedFunctionExpressionProp extends AbstractEOCallExpressionProp<ClassMethod> {
  override build(): ClassMethod {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'FunctionExpression',
      'expected lastArg to be a FunctionExpression'
    );
    return replaceSuperExpressions(
      j.classMethod.from({
        kind: defined(this.kind),
        key: this.key,
        params: lastArg.params,
        body: lastArg.body,
        comments: this.comments,
        decorators: this.buildDecorators(),
      }),
      this,
      { isAction: false, isComputed: true }
    );
  }
}
