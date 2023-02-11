import { default as j } from 'jscodeshift';
import type {
  ASTPath,
  CallExpression,
  ClassBody,
  ClassBodyBuilder,
  ClassDeclaration,
  Decorator,
  EOExpression,
  EOMixin,
  Identifier,
  RawEOExtendExpression,
} from './ast';
import { isEOExpression, isNode } from './ast';
import { createIdentifierDecorator } from './decorator-helper';
import type { DecoratorImportInfoMap } from './decorator-info';
import type { EOProp } from './eo-prop/index';
import makeEOProp, { EOClassDecorator } from './eo-prop/index';
import logger from './log-helper';
import type { Options } from './options';
import { getClassName, getExpressionToReplace } from './parse-helper';
import { withComments } from './transform-helper';

export default class EOExtendExpression {
  private className: string;
  private superClassName: string;

  private expression: EOExpression | null = null;
  private mixins: EOMixin[];
  readonly properties: EOProp[];
  readonly decorators: EOClassDecorator[];

  constructor(
    private path: ASTPath<RawEOExtendExpression>,
    private filePath: string,
    existingDecoratorImportInfos: DecoratorImportInfoMap,
    private options: Options
  ) {
    const raw = path.value;

    this.className = getClassName(path, filePath, options.runtimeData.type);
    this.superClassName = raw.callee.object.name;

    const mixins: EOMixin[] = [];
    for (const arg of raw.arguments) {
      if (isEOExpression(arg)) {
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
    const properties: EOProp[] = [];
    const decorators: EOClassDecorator[] = [];

    for (const property of rawProperties) {
      const eoProp = makeEOProp(
        property,
        existingDecoratorImportInfos,
        options
      );
      if (eoProp instanceof EOClassDecorator) {
        decorators.push(eoProp);
      } else {
        properties.push(eoProp);
      }
    }

    this.properties = properties;
    this.decorators = decorators;
  }

  transform(): boolean {
    const es6ClassDeclaration = this.build();
    if (es6ClassDeclaration) {
      const expressionToReplace = getExpressionToReplace(j, this.path);
      j(expressionToReplace).replaceWith(
        withComments(es6ClassDeclaration, expressionToReplace.value)
      );
      return true;
    } else {
      return false;
    }
  }

  private build(): ClassDeclaration | null {
    const errors = this.validate();
    if (errors.length > 0) {
      const message = errors.join('\n\t');
      logger.error(
        `[${this.filePath}]: FAILURE \nValidation errors for class '${this.className}': \n\t${message}`
      );
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

  private buildClassIdentifier(): Identifier {
    const { className, superClassName } = this;
    return j.identifier(
      className === superClassName ? `_${className}` : className
    );
  }

  private buildClassBody(): ClassBody {
    const { properties } = this;
    let classBody: Parameters<ClassBodyBuilder>[0] = [];

    for (const prop of properties) {
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
  private buildSuperClassExpression(): CallExpression | Identifier {
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

  private buildClassDecorators(): Decorator[] {
    const { decorators } = this;
    const { classicDecorator } = this.options;
    const classDecorators: Decorator[] = [];

    if (classicDecorator) {
      classDecorators.push(createIdentifierDecorator('classic'));
    }

    for (const decorator of decorators) {
      classDecorators.push(decorator.build());
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

    if (isNode(this.path.parentPath?.value, 'MemberExpression')) {
      errors.push(
        `class has chained definition (e.g. ${this.superClassName}.extend().reopenClass();`
      );
    }

    for (const prop of this.properties) {
      errors = [...errors, ...prop.errors];
    }
    return errors;
  }

  private makeError(message: string): string {
    return `[${this.className}]: Transform not supported - ${message}`;
  }
}
