import type {
  ASTPath,
  EOExpression,
  EOMixin,
  RawEOExtendExpression,
} from './ast';
import { isEOExpression, isNode } from './ast';
import type { DecoratorImportInfoMap } from './decorator-info';
import type { EOProp } from './eo-prop/index';
import type { Options } from './options';
import { getClassName, getEOProps } from './parse-helper';

export default class EOExtendExpression {
  static from(
    path: ASTPath<RawEOExtendExpression>,
    filePath: string,
    existingDecoratorImportInfos: DecoratorImportInfoMap,
    options: Options
  ): EOExtendExpression {
    let className = getClassName(path, filePath, options.runtimeData.type);
    const superClassName = path.value.callee.object.name;

    if (className === superClassName) {
      className = `_${className}`;
    }

    return new this(
      path,
      className,
      superClassName,
      existingDecoratorImportInfos,
      options
    );
  }

  readonly expression: EOExpression | null = null;
  readonly mixins: EOMixin[];
  readonly properties: EOProp[];

  private _parseErrors: string[] = [];

  constructor(
    private path: ASTPath<RawEOExtendExpression>,
    readonly className: string,
    readonly superClassName: string,
    existingDecoratorImportInfos: DecoratorImportInfoMap,
    options: Options
  ) {
    const raw = path.value;

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

    this.properties = getEOProps(
      this.expression,
      existingDecoratorImportInfos,
      options
    );
  }

  /**
   * Iterates through instance properties to verify if there are any props that
   * can not be transformed
   */
  get errors(): string[] {
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
