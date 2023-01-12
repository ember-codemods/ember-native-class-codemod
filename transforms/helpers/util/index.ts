import type { Collection, JSCodeshift } from 'jscodeshift';
import type { ObjectExpressionProp } from './ast';

export const LAYOUT_DECORATOR_NAME = 'layout' as const;
export const LAYOUT_DECORATOR_LOCAL_NAME = 'templateLayout' as const;

export const DECORATOR_PATHS = {
  '@ember/object': {
    importPropDecoratorMap: {
      observer: 'observes',
      computed: 'computed',
    },
    decoratorPath: '@ember/object',
  },
  '@ember/object/evented': {
    importPropDecoratorMap: {
      on: 'on',
    },
    decoratorPath: '@ember-decorators/object',
  },
  '@ember/controller': {
    importPropDecoratorMap: {
      inject: 'inject',
    },
    decoratorPath: '@ember/controller',
  },
  '@ember/service': {
    importPropDecoratorMap: {
      inject: 'inject',
    },
    decoratorPath: '@ember/service',
  },
  '@ember/object/computed': {
    decoratorPath: '@ember/object/computed',
  },
} as const;

export const DECORATOR_PATH_OVERRIDES = {
  observes: '@ember-decorators/object',
} as const;

export const EMBER_DECORATOR_SPECIFIERS = {
  '@ember/object': ['action'],
  '@ember-decorators/object': ['off', 'on', 'unobserves'],
  '@ember-decorators/component': [
    'classNames',
    'attributeBindings',
    'classNameBindings',
    LAYOUT_DECORATOR_NAME,
    'tagName',
    LAYOUT_DECORATOR_LOCAL_NAME,
  ],
} as const;

export const METHOD_DECORATORS = ['action', 'on', 'observer'] as const;

export const ACTION_SUPER_EXPRESSION_COMMENT = [
  ' TODO: This call to super is within an action, and has to refer to the parent',
  " class's actions to be safe. This should be refactored to call a normal method",
  ' on the parent class. If the parent class has not been converted to native',
  ' classes, it may need to be refactored as well. See',
  ' https: //github.com/scalvert/ember-native-class-codemod/blob/master/README.md',
  ' for more details.',
] as const;

export const LIFECYCLE_HOOKS = [
  // Methods
  '$',
  'addObserver',
  'cacheFor',
  'decrementProperty',
  'destroy',
  'didReceiveAttrs',
  'didRender',
  'didUpdate',
  'didUpdateAttrs',
  'get',
  'getProperties',
  'getWithDefault',
  'has',
  'incrementProperty',
  'init',
  'notifyPropertyChange',
  'off',
  'on',
  'one',
  'readDOMAttr',
  'removeObserver',
  'rerender',
  'send',
  'set',
  'setProperties',
  'toString',
  'toggleProperty',
  'trigger',
  'willDestroy',
  'willRender',
  'willUpdate',

  // Events
  'didInsertElement',
  'didReceiveAttrs',
  'didRender',
  'didUpdate',
  'didUpdateAttrs',
  'willClearRender',
  'willDestroyElement',
  'willInsertElement',
  'willRender',
  'willUpdate',

  // Touch events
  'touchStart',
  'touchMove',
  'touchEnd',
  'touchCancel',

  // Keyboard events
  'keyDown',
  'keyUp',
  'keyPress',

  // Mouse events
  'mouseDown',
  'mouseUp',
  'contextMenu',
  'click',
  'doubleClick',
  'mouseMove',
  'focusIn',
  'focusOut',
  'mouseEnter',
  'mouseLeave',

  // Form events
  'submit',
  'change',
  'focusIn',
  'focusOut',
  'input',

  // HTML5 drag and drop events
  'dragStart',
  'drag',
  'dragEnter',
  'dragLeave',
  'dragOver',
  'dragEnd',
  'drop',
] as const;

/**
 * Get a property from and object, useful to get nested props without checking for null values
 *
 * @deprecated
 */
export function get(obj: object, path: string): any {
  return path.split('.').reduce(function (currentObject, pathSegment) {
    return typeof currentObject == 'undefined' || currentObject === null
      ? currentObject
      : currentObject[pathSegment as keyof typeof currentObject];
  }, obj);
}

/** Get the first declaration in the program */
export function getFirstDeclaration(
  j: JSCodeshift,
  root: Collection<unknown>
): Collection<unknown> {
  return j(root.find(j.Declaration).at(0).get());
}

/** Return name of the property */
export function getPropName(prop: ObjectExpressionProp): string {
  return get(prop, 'key.name');
}

/** Return type of the property */
export function getPropType(prop: ObjectExpressionProp): string {
  return get(prop, 'value.type');
}

/** Convert the first letter to uppercase */
export function capitalizeFirstLetter(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}

/** Returns true if the first character in the word is uppercase */
export function startsWithUpperCaseLetter(word = ''): boolean {
  return !!word && word.charAt(0) !== word.charAt(0).toLowerCase();
}

const ClassDecoratorPropNames = new Set([
  'layout',
  'tagName',
  'classNames',
  'classNameBindings',
  'attributeBindings',
]);

/** Return true if prop is of name `tagName` or `classNames` */
export function isClassDecoratorProp(propName: string): boolean {
  return ClassDecoratorPropNames.has(propName);
}