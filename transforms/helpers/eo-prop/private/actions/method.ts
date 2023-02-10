import { default as j } from 'jscodeshift';
import type { ClassMethod } from '../../../ast';
import { replaceSuperExpressions } from '../../../transform-helper';
import EOMethodProp from '../method';
import { buildActionDecorator } from '../../../decorator-helper';

export default class ActionMethod extends EOMethodProp {
  // FIXME: Try to reuse EOMethodProp build?
  override build(): ClassMethod {
    return replaceSuperExpressions(
      j.classMethod.from({
        // @ts-expect-error FIXME
        kind: this.kind,
        key: this.key,
        params: this.params,
        body: this.body,
        comments: this.comments ?? null,
        decorators: buildActionDecorator(),
      }),
      this,
      // FIXME: This is fishy
      { isAction: true }
    );
  }

  override get isOverridden(): boolean {
    return this.runtimeData.overriddenActions?.includes(this.name) ?? false;
  }
}
