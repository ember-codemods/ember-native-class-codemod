import type { JSCodeshift } from 'jscodeshift';
import type { Collection, Declaration } from '../ast';

export const LAYOUT_DECORATOR_NAME = 'layout' as const;
export type LAYOUT_DECORATOR_NAME = typeof LAYOUT_DECORATOR_NAME;
export const LAYOUT_DECORATOR_LOCAL_NAME = 'templateLayout' as const;

interface DecoratorPathInfo {
  readonly importPropDecoratorMap?: Record<string, string>;
  readonly decoratorPath: string;
}

export const DECORATOR_PATHS: ReadonlyMap<string, DecoratorPathInfo> = new Map([
  [
    '@ember/object',
    {
      importPropDecoratorMap: {
        observer: 'observes',
        computed: 'computed',
      },
      decoratorPath: '@ember/object',
    },
  ],
  [
    '@ember/object/evented',
    {
      importPropDecoratorMap: {
        on: 'on',
      },
      decoratorPath: '@ember-decorators/object',
    },
  ],
  [
    '@ember/controller',
    {
      importPropDecoratorMap: {
        inject: 'inject',
      },
      decoratorPath: '@ember/controller',
    },
  ],
  [
    '@ember/service',
    {
      importPropDecoratorMap: {
        inject: 'inject',
      },
      decoratorPath: '@ember/service',
    },
  ],
  [
    '@ember/object/computed',
    {
      decoratorPath: '@ember/object/computed',
    },
  ],
]);

export const DECORATOR_PATH_OVERRIDES: ReadonlyMap<string, string> = new Map([
  ['observes', '@ember-decorators/object'],
]);

export const EMBER_DECORATOR_SPECIFIERS: ReadonlyArray<[string, string[]]> = [
  ['@ember/object', ['action']],
  ['@ember-decorators/object', ['off', 'on', 'unobserves']],
  [
    '@ember-decorators/component',
    [
      'classNames',
      'attributeBindings',
      'classNameBindings',
      LAYOUT_DECORATOR_NAME,
      'tagName',
      LAYOUT_DECORATOR_LOCAL_NAME,
    ],
  ],
];

export const METHOD_DECORATORS = new Set(['action', 'on', 'observer']);

export const ACTION_SUPER_EXPRESSION_COMMENT = [
  ' TODO: This call to super is within an action, and has to refer to the parent',
  " class's actions to be safe. This should be refactored to call a normal method",
  ' on the parent class. If the parent class has not been converted to native',
  ' classes, it may need to be refactored as well. See',
  ' https: //github.com/scalvert/ember-native-class-codemod/blob/master/README.md',
  ' for more details.',
];

export const LIFECYCLE_HOOKS = new Set([
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
]);

// DANGER! This assumes that the correct decorator is imported just because of
// the name.
const ALLOWED_OBJECT_LITERAL_DECORATORS = new Set([
  // @ember/object
  'action',
  'computed',

  // @ember/object/compat
  'dependentKeyCompat',

  // @ember/object/computed
  'alias',
  'and',
  'bool',
  'collect',
  'deprecatingAlias',
  'empty',
  'equal',
  'filter',
  'filterBy',
  'gt',
  'gte',
  'intersect',
  'lt',
  'lte',
  'map',
  'mapBy',
  'match',
  'max',
  'min',
  'none',
  'not',
  'notEmpty',
  'oneWay',
  'or',
  'readOnly',
  'reads',
  'setDiff',
  'sort',
  'sum',
  'union',
  'uniq',
  'uniqBy',

  // @glimmer/tracking
  // 'cached',
  'tracked',

  // @ember-decorators/component
  'attribute',
  'className',

  // @ember-decorators/object
  'observes',
  'on',
]);

/**
 * Allows transformation of decorators in EmberObject's object-literal argument
 * only if they are part of the `ALLOWED_OBJECT_LITERAL_DECORATORS` set or
 * configured by the user in the `objectLiteralDecorators` config.
 */
export function allowObjectLiteralDecorator(
  decoratorName: string,
  userAllowList: string[] = []
): boolean {
  return (
    ALLOWED_OBJECT_LITERAL_DECORATORS.has(decoratorName) ||
    userAllowList.includes(decoratorName)
  );
}

/** Get the first declaration in the program */
export function getFirstDeclaration(
  j: JSCodeshift,
  root: Collection
): Collection<Declaration> {
  return root.find(j.Declaration).at(0) as Collection<Declaration>;
}

/** Convert the first letter to uppercase */
export function capitalizeFirstLetter(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}
