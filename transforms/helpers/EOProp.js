const {
  get,
  getPropName,
  getPropType,
  getModifier,
  isClassDecoratorProp,
  LAYOUT_DECORATOR_LOCAL_NAME,
  LAYOUT_DECORATOR_NAME,
} = require('./util');

/**
 * Ember Objet Property
 *
 * A wrapper object for ember object properties
 */
class EOProp {
  constructor(eoProp) {
    this._prop = eoProp;
    this.decorators = [];
    this.modifiers = [];
    this.decoratorArgs = {};
  }

  get value() {
    return get(this._prop, 'value');
  }

  get kind() {
    let kind = get(this._prop, 'kind');
    let method = get(this._prop, 'method');

    if (
      kind === 'init' &&
      this.hasDecorators &&
      this.decorators.find(d => d.importedName === 'computed')
    ) {
      kind = 'get';
    }

    if (method || this.hasMethodDecorator) {
      kind = 'method';
    }

    return kind;
  }

  get key() {
    return get(this._prop, 'key');
  }

  get name() {
    return getPropName(this._prop);
  }

  get type() {
    return getPropType(this._prop);
  }

  get calleeName() {
    return get(this.calleeObject, 'callee.name');
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

  get decoratorNames() {
    return this.decorators.map(d => d.name);
  }

  get classDecoratorName() {
    if (this.name === LAYOUT_DECORATOR_NAME && this.value.name === LAYOUT_DECORATOR_NAME) {
      return LAYOUT_DECORATOR_LOCAL_NAME;
    }
    return this.name;
  }

  get isLayoutDecorator() {
    return this.classDecoratorName === LAYOUT_DECORATOR_NAME;
  }

  get isTemplateLayoutDecorator() {
    return this.classDecoratorName === LAYOUT_DECORATOR_LOCAL_NAME;
  }

  get isCallExpression() {
    return this.type === 'CallExpression';
  }

  get hasDecorators() {
    return this.decorators.length;
  }

  get callExprArgs() {
    return get(this.calleeObject, 'arguments') || [];
  }

  get shouldRemoveLastArg() {
    return this.kind === 'method' || this.kind === 'get';
  }

  get hasModifierWithArgs() {
    return this.modifiers.some(modifier => modifier.args.length);
  }

  get hasVolatile() {
    return this.modifiers.some(modifier => get(modifier, 'prop.name') === 'volatile');
  }

  get hasReadOnly() {
    return this.modifiers.some(modifier => get(modifier, 'prop.name') === 'readOnly');
  }

  get isVolatileReadOnly() {
    return this.modifiers.length === 2 && this.hasVolatile && this.hasReadOnly;
  }

  get isTagName() {
    return this.name === 'tagName';
  }

  get isClassNames() {
    return this.name === 'classNames';
  }

  get isAction() {
    return this.name === 'actions';
  }

  get hasClassNameDecorator() {
    return this.decoratorNames.includes('className');
  }

  get hasAttributeDecorator() {
    return this.decoratorNames.includes('attribute');
  }

  get hasUnobservesDecorator() {
    return this.decoratorNames.includes('unobserves');
  }

  get hasOffDecorator() {
    return this.decoratorNames.includes('off');
  }

  get hasRuntimeData() {
    return !!this.runtimeType;
  }

  get hasMethodDecorator() {
    return this.decorators.find(d => d.isMethodDecorator);
  }

  get hasMetaDecorator() {
    return this.decorators.find(d => d.isMetaDecorator);
  }

  setCallExpressionProps() {
    let calleeObject = get(this._prop, 'value');
    const modifiers = [getModifier(calleeObject)];
    while (get(calleeObject, 'callee.type') === 'MemberExpression') {
      calleeObject = get(calleeObject, 'callee.object');
      modifiers.push(getModifier(calleeObject));
    }
    this.calleeObject = calleeObject;
    this.modifiers = modifiers.reverse();
    this.modifiers.shift();
  }

  setDecorators(importedDecoratedProps) {
    if (this.isCallExpression) {
      this.setCallExpressionProps();

      if (importedDecoratedProps[this.calleeName]) {
        this.decorators.push(importedDecoratedProps[this.calleeName]);
      } else if (this.isComputed) {
        this.decorators.push({ name: this.calleeName });
      }
    }
  }

  addBindingProps(attributeBindingsProps, classNameBindingsProps) {
    if (attributeBindingsProps[this.name]) {
      this.decorators.push({ name: 'attribute' });
      this.propList = attributeBindingsProps[this.name];
    } else if (classNameBindingsProps[this.name]) {
      this.decorators.push({ name: 'className' });
      this.propList = classNameBindingsProps[this.name];
    }
  }

  setRuntimeData({
    computedProperties = [],
    // observedProperties = [],
    // observerProperties = {},
    offProperties = {},
    overriddenActions = [],
    overriddenProperties = [],
    // ownProperties = [],
    type = '',
    unobservedProperties = {},
  }) {
    if (!type) {
      return;
    }

    const name = this.name;
    if (Object.keys(unobservedProperties).includes(name)) {
      this.decorators.push({ name: 'unobserves' });
      this.decoratorArgs['unobserves'] = unobservedProperties[name];
    }
    if (Object.keys(offProperties).includes(name)) {
      this.decorators.push({ name: 'off' });
      this.decoratorArgs['off'] = offProperties[name];
    }
    if (computedProperties.includes(name)) {
      this.isComputed = true;
    }
    if (this.isAction) {
      this.overriddenActions = overriddenActions;
    }
    this.isOverridden = overriddenProperties.includes(name);
    this.runtimeType = type;
  }
}

module.exports = EOProp;
