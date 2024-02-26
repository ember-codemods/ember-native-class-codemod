import { default as j } from 'jscodeshift';
import * as AST from './ast';
import { createIdentifierDecorator } from './decorator-helper';
import type { DecoratorImportInfoMap } from './decorator-info';
import type { EOClassDecorator, EOProp } from './eo-prop/index';
import makeEOProp, { isEOClassDecorator, isEOProp } from './eo-prop/index';
import type { Options } from './options';
import { getClassName, getExpressionToReplace } from './parse-helper';
import { withComments } from './transform-helper';
import type { DecoratorImportSpecs } from './util/index';

export interface TransformResult {
  className: string;
  success: boolean;
  errors: readonly string[];
}

export default class EOExtendExpression {
  private className: string;
  private superClassName: string;
  private properties: Array<EOClassDecorator | EOProp>;
  private expression: AST.EOExpression | null = null;
  private mixins: AST.EOMixin[];
  private errors: readonly string[] = [];

  constructor(
    private path: AST.Path<AST.EOExtendExpression>,
    filePath: string,
    existingDecoratorImportInfos: DecoratorImportInfoMap,
    private options: Options
  ) {
    const raw = path.value;

    this.superClassName = raw.callee.object.name;
    this.className = getClassName(
      path,
      filePath,
      this.superClassName,
      options.runtimeData?.type
    );

    const mixins: AST.EOMixin[] = [];
    for (const arg of raw.arguments) {
      if (AST.isEOExpression(arg)) {
        if (this.expression !== null) {
          this._parseErrors.push(
            this.makeError(
              'extend expression has multiple object literal arguments'
            )
          );
        }
        this.expression = arg;
      } else {
        mixins.push(arg);
      }
    }
    this.mixins = mixins;

    const rawProperties = this.expression?.properties ?? [];
    this.properties = rawProperties.map((raw) =>
      makeEOProp(raw, existingDecoratorImportInfos, options)
    );
  }

  transform(): TransformResult {
    const result: TransformResult = {
      className: this.className,
      success: false,
      errors: [],
    };

    const es6ClassDeclaration = this.build();
    if (es6ClassDeclaration) {
      const expressionToReplace = getExpressionToReplace(this.path);
      j(expressionToReplace).replaceWith(
        withComments(es6ClassDeclaration, expressionToReplace.value)
      );
      result.success = true;
    } else {
      result.errors = this.errors;
    }

    return result;
  }

  /**
   * Get the map of decorators to import other than the computed props, services etc
   * which already have imports in the code
   */
  get decoratorImportSpecs(): DecoratorImportSpecs {
    let specs = {
      action: false,
      classNames: false,
      classNameBindings: false,
      attributeBindings: false,
      layout: false,
      templateLayout: false,
      off: false,
      tagName: false,
      observes: false,
      unobserves: false,
    };
    const { properties } = this;
    for (const prop of properties) {
      specs = {
        action: specs.action || prop.decoratorImportSpecs.action,
        classNames: specs.classNames || prop.decoratorImportSpecs.classNames,
        classNameBindings:
          specs.classNameBindings ||
          prop.decoratorImportSpecs.classNameBindings,
        attributeBindings:
          specs.attributeBindings ||
          prop.decoratorImportSpecs.attributeBindings,
        layout: specs.layout || prop.decoratorImportSpecs.layout,
        templateLayout:
          specs.templateLayout || prop.decoratorImportSpecs.templateLayout,
        off: specs.off || prop.decoratorImportSpecs.off,
        tagName: specs.tagName || prop.decoratorImportSpecs.tagName,
        observes: specs.observes || prop.decoratorImportSpecs.observes,
        unobserves: specs.unobserves || prop.decoratorImportSpecs.unobserves,
      };
    }
    return specs;
  }

  private build(): AST.ClassDeclaration | null {
    const errors = this.validate();
    if (errors.length > 0) {
      return null;
    }

    const classDeclaration = j.classDeclaration.from({
      id: this.buildClassIdentifier(),
      body: this.buildClassBody(),
      superClass: this.buildSuperClassExpression(),
    });

    // @ts-expect-error jscodeshift AST types are incorrect
    // If this ever gets fixed, check if the builder `.from` method above
    // will now take a decorators param.
    classDeclaration.decorators = this.buildClassDecorators();

    return classDeclaration;
  }

  private buildClassIdentifier(): AST.Identifier {
    const { className, superClassName } = this;
    return j.identifier(
      className === superClassName ? `_${className}` : className
    );
  }

  private buildClassBody(): AST.ClassBody {
    const objectProperties = this.properties.filter(isEOProp);
    let classBody: Parameters<AST.ClassBodyBuilder>[0] = [];

    for (const prop of objectProperties) {
      const built = prop.build();
      if (Array.isArray(built)) {
        classBody = [...classBody, ...built];
      } else {
        classBody.push(built);
      }
    }

    return j.classBody(classBody);
  }

  /**
   * Create the Identifier for the super class.
   * If there are Mixins, the CallExpression will be a CallExpression with
   * the Mixins included.
   */
  private buildSuperClassExpression(): AST.CallExpression | AST.Identifier {
    const { superClassName, mixins } = this;
    if (mixins.length > 0) {
      return j.callExpression(
        j.memberExpression(
          j.identifier(superClassName),
          j.identifier('extend')
        ),
        mixins
      );
    }
    return j.identifier(superClassName);
  }

  private buildClassDecorators(): AST.Decorator[] {
    const classDecoratorProperties = this.properties.filter(isEOClassDecorator);
    const { classicDecorator } = this.options;
    const classDecorators: AST.Decorator[] = [];

    if (classicDecorator) {
      classDecorators.push(createIdentifierDecorator('classic'));
    }

    for (const prop of classDecoratorProperties) {
      classDecorators.push(prop.build());
    }

    return classDecorators;
  }

  private _parseErrors: string[] = [];

  /**
   * Iterates through instance properties to verify if there are any props that
   * can not be transformed
   */
  private validate(): string[] {
    let errors = this._parseErrors;

    if (AST.isNode(this.path.parentPath?.value, 'MemberExpression')) {
      errors.push(
        `class has chained definition (e.g. ${this.superClassName}.extend().reopenClass();`
      );
    }

    for (const prop of this.properties) {
      errors = [...errors, ...prop.errors];
    }

    return (this.errors = errors);
  }

  private makeError(message: string): string {
    return `[${this.className}]: Transform not supported - ${message}`;
  }
}
