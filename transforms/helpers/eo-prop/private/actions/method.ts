import { default as j } from 'jscodeshift';
import type { ClassMethod } from '../../../ast';
import { buildActionDecorator } from '../../../decorator-helper';
import { replaceActionSuperExpressions } from '../../../transform-helper';
import EOMethodProp from '../method';

export default class ActionMethod extends EOMethodProp {
  // FIXME: Try to reuse EOMethodProp build?
  override build(): ClassMethod {
    return replaceActionSuperExpressions(
      j.classMethod.from({
        kind: this.kind,
        key: this.key,
        params: this.params,
        body: this.body,
        comments: this.comments,
        decorators: buildActionDecorator(),
      }),
      this.replaceSuperWithUndefined
    );
  }

  override get isOverridden(): boolean {
    return this.runtimeData.overriddenActions.includes(this.name);
  }
}
