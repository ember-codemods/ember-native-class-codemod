const {
  get,
  getPropName,
  getPropType,
  getPropCalleeName,
  isClassDecoratorProp,
  METHOD_DECORATORS
} = require("./util");

/**
 * Ember Objet Property
 *
 * A wrapper object for ember object properties
 */
class EOProp {
  constructor(eoProp) {
    this._prop = eoProp;
    this.decoratorNames = [];
  }

  get value() {
    return get(this._prop, "value");
  }

  get kind() {
    let kind = get(this._prop, "kind");
    if (kind === "init" && this.hasDecorators && !this.hasMethodDecorator) {
      kind = "get";
    }
    return kind;
  }

  get key() {
    return get(this._prop, "key");
  }

  get name() {
    return getPropName(this._prop);
  }

  get type() {
    return getPropType(this._prop);
  }

  get calleeName() {
    return getPropCalleeName(this._prop);
  }

  get comments() {
    return this._prop.comments;
  }

  get computed() {
    return this._prop.computed;
  }

  get isClassDecorator() {
    return isClassDecoratorProp(this.name);
  }

  get isCallExpression() {
    return this.type === "CallExpression";
  }

  get hasDecorators() {
    return this.decoratorNames.length;
  }

  get callExprArgs() {
    return get(this._prop, "value.arguments") || [];
  }

  get hasNonLiteralArg() {
    return this.callExprArgs.some(arg => arg.type !== "Literal");
  }

  setDecorators(importedDecoratedProps) {
    if (this.isCallExpression) {
      const { decoratorName, importedName } =
        importedDecoratedProps[this.calleeName] || {};
      if (decoratorName) {
        this.hasMethodDecorator = METHOD_DECORATORS.includes(importedName);
        this.decoratorNames.push(decoratorName);
      }
    }
  }

  addBindingProps(attributeBindingsProps, classNameBindingsProps) {
    if (attributeBindingsProps[this.name]) {
      this.decoratorNames.push("attribute");
      this.propList = attributeBindingsProps[this.name];
    } else if (classNameBindingsProps[this.name]) {
      this.decoratorNames.push("className");
      this.propList = classNameBindingsProps[this.name];
    }
  }
}

module.exports = EOProp;
