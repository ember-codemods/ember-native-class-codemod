const {
  get,
  getPropName,
  getPropType,
  getModifier,
  isClassDecoratorProp
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
    this.modifiers = [];
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
    return get(this.calleeObject, "callee.name");
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
    return get(this.calleeObject, "arguments") || [];
  }

  get hasNonLiteralArg() {
    return this.callExprArgs.some(arg => arg.type !== "Literal");
  }

  get hasModifierWithArgs() {
    return this.modifiers.some(modifier => modifier.args.length);
  }

  get hasVolatile() {
    return this.modifiers.some(
      modifier => get(modifier, "prop.name") === "volatile"
    );
  }

  get hasReadOnly() {
    return this.modifiers.some(
      modifier => get(modifier, "prop.name") === "readOnly"
    );
  }

  get isVolatileReadOnly() {
    return this.modifiers.length === 2 && this.hasVolatile && this.hasReadOnly;
  }

  setCallExpressionProps() {
    let calleeObject = get(this._prop, "value");
    const modifiers = [getModifier(calleeObject)];
    while (get(calleeObject, "callee.type") === "MemberExpression") {
      calleeObject = get(calleeObject, "callee.object");
      modifiers.push(getModifier(calleeObject));
    }
    this.calleeObject = calleeObject;
    this.modifiers = modifiers.reverse();
    this.modifiers.shift();
  }

  setDecorators(importedDecoratedProps) {
    if (this.isCallExpression) {
      this.setCallExpressionProps();
      const { decoratorName, isMethodDecorator, isMetaDecorator } =
        importedDecoratedProps[this.calleeName] || {};
      if (decoratorName) {
        this.hasMethodDecorator = isMethodDecorator;
        this.hasMetaDecorator = isMetaDecorator;
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
