import { default as j } from 'jscodeshift';
import type { ClassMethod } from '../../../ast';
import { isEOMethod } from '../../../ast';
import { replaceComputedSuperExpressions } from '../../../transform-helper';
import { assert, defined } from '../../../util/types';
import AbstractEOCallExpressionProp from './abstract';

export default class EOComputedObjectExpressionProp extends AbstractEOCallExpressionProp<
  ClassMethod[]
> {
  override build(): ClassMethod[] {
    const args = this.arguments;
    const lastArg = args[args.length - 1];
    assert(
      lastArg && lastArg.type === 'ObjectExpression',
      'expected lastArg to be a ObjectExpression'
    );
    // FIXME: In this case, existing decorators should probably fail validation
    const classMethods = lastArg.properties.map((property) => {
      assert(isEOMethod(property), 'expected EOMethod');
      assert(
        (['init', 'get', 'set', 'method'] as const).includes(
          property.key.name as 'init' | 'get' | 'set' | 'method'
        )
      );
      const rawKind = property.key.name as 'init' | 'get' | 'set' | 'method';
      const kind = rawKind === 'init' ? 'method' : rawKind;

      const key = this.key;

      const params = [...property.params];
      params.shift();

      return replaceComputedSuperExpressions(
        j.classMethod.from({
          kind,
          key,
          params,
          body: property.body,
          comments: property.comments ?? null,
        }),
        this.replaceSuperWithUndefined,
        this.key
      );
    });

    const firstMethod = defined(classMethods[0]);
    firstMethod.comments = [
      ...(firstMethod.comments ?? []),
      ...(this.comments ?? []),
    ];
    firstMethod.decorators = this.buildDecorators();

    return classMethods;
  }
}
