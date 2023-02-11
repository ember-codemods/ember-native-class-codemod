import { default as j } from 'jscodeshift';
import type { ClassProperty } from '../../../ast';
import AbstractEOCallExpressionProp from './abstract';

export default class EODecoratedProp extends AbstractEOCallExpressionProp<ClassProperty> {
  build(): ClassProperty {
    const classProp = j.classProperty.from({
      key: this.key,
      // TODO: This is probably where we can remove the = undefined value;
      value: this.hasDecorators ? null : this.value,
      comments: this.comments,
      computed: this.rawProp.computed ?? false,
    });

    // @ts-expect-error jscodeshift AST types are incorrect
    // If this ever gets fixed, check if the builder `.from` method above
    // will now take a decorators param.
    classProp.decorators = this.buildDecorators();

    return classProp;
  }
}
