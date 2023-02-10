import { default as j } from 'jscodeshift';
import type { ClassProperty } from '../../../ast';
import AbstractEOCallExpressionProp from './abstract';

// FIXME: Does this now overlap completely with EOSimple?
export default class EODecoratedProp extends AbstractEOCallExpressionProp<ClassProperty> {
  override build(): ClassProperty {
    const classProp = j.classProperty.from({
      key: this.key,
      value: this.shouldSetValue ? this.value : null,
      comments: this.comments,
      computed: this.computed,
    });

    // @ts-expect-error jscodeshift AST types are incorrect
    // If this ever gets fixed, check if the builder `.from` method above
    // will now take a decorators param.
    classProp.decorators = this.buildDecorators();

    return classProp;
  }

  // FIXME: Is this still shared with EOCallExpressionProp?
  private get shouldSetValue(): boolean {
    // TODO: This is probably where we can remove the = undefined value;
    return (
      !this.hasDecorators ||
      this.decoratorNames.every(
        (name) => name === 'className' || name === 'attribute'
      )
    );
  }
}
