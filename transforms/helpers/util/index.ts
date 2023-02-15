export const ACTIONS_NAME = 'actions' as const;
export type ACTIONS_NAME = typeof ACTIONS_NAME;

export const ACTION_DECORATOR_NAME = 'action' as const;
export const ATTRIBUTE_BINDINGS_DECORATOR_NAME = 'attributeBindings' as const;
export const COMPUTED_DECORATOR_NAME = 'computed' as const;
export const CLASS_NAME_BINDINGS_DECORATOR_NAME = 'classNameBindings' as const;
export const CLASS_NAMES_DECORATOR_NAME = 'classNames' as const;
export const LAYOUT_DECORATOR_LOCAL_NAME = 'templateLayout' as const;
export const LAYOUT_DECORATOR_NAME = 'layout' as const;
export const OFF_DECORATOR_NAME = 'off' as const;
export const TAG_NAME_DECORATOR_NAME = 'tagName' as const;
export const UNOBSERVES_DECORATOR_NAME = 'unobserves' as const;
export type ATTRIBUTE_BINDINGS_DECORATOR_NAME =
  typeof ATTRIBUTE_BINDINGS_DECORATOR_NAME;
export type CLASS_NAME_BINDINGS_DECORATOR_NAME =
  typeof CLASS_NAME_BINDINGS_DECORATOR_NAME;
export type CLASS_NAMES_DECORATOR_NAME = typeof CLASS_NAMES_DECORATOR_NAME;
export type LAYOUT_DECORATOR_NAME = typeof LAYOUT_DECORATOR_NAME;
export type TAG_NAME_DECORATOR_NAME = typeof TAG_NAME_DECORATOR_NAME;

const OBSERVES_DECORATOR_NAME = 'observes' as const;
const ON_DECORATOR_NAME = 'on' as const;

interface DecoratorPathInfo {
  readonly importPropDecoratorMap?: Record<string, string>;
  readonly decoratorPath: string;
}

export interface DecoratorImportSpecs {
  [ACTION_DECORATOR_NAME]: boolean;
  [CLASS_NAMES_DECORATOR_NAME]: boolean;
  [CLASS_NAME_BINDINGS_DECORATOR_NAME]: boolean;
  [ATTRIBUTE_BINDINGS_DECORATOR_NAME]: boolean;
  [LAYOUT_DECORATOR_NAME]: boolean;
  [LAYOUT_DECORATOR_LOCAL_NAME]: boolean;
  [OFF_DECORATOR_NAME]: boolean;
  [TAG_NAME_DECORATOR_NAME]: boolean;
  [UNOBSERVES_DECORATOR_NAME]: boolean;
}

export const DECORATOR_PATHS: ReadonlyMap<string, DecoratorPathInfo> = new Map([
  [
    '@ember/object',
    {
      importPropDecoratorMap: {
        observer: OBSERVES_DECORATOR_NAME,
        computed: COMPUTED_DECORATOR_NAME,
      },
      decoratorPath: '@ember/object',
    },
  ],
  [
    '@ember/object/evented',
    {
      importPropDecoratorMap: {
        on: ON_DECORATOR_NAME,
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
  [OBSERVES_DECORATOR_NAME, '@ember-decorators/object'],
]);

export const CLASS_DECORATOR_NAMES = [
  ATTRIBUTE_BINDINGS_DECORATOR_NAME,
  CLASS_NAME_BINDINGS_DECORATOR_NAME,
  CLASS_NAMES_DECORATOR_NAME,
  LAYOUT_DECORATOR_NAME,
  TAG_NAME_DECORATOR_NAME,
];
type CLASS_DECORATOR_NAMES = typeof CLASS_DECORATOR_NAMES;
export type ClassDecoratorName = CLASS_DECORATOR_NAMES[number];

export const EMBER_DECORATOR_SPECIFIERS: ReadonlyArray<[string, string[]]> = [
  ['@ember/object', [ACTION_DECORATOR_NAME]],
  [
    '@ember-decorators/object',
    [OFF_DECORATOR_NAME, ON_DECORATOR_NAME, UNOBSERVES_DECORATOR_NAME],
  ],
  [
    '@ember-decorators/component',
    [...CLASS_DECORATOR_NAMES, LAYOUT_DECORATOR_LOCAL_NAME],
  ],
];

export const METHOD_DECORATORS = new Set([
  ACTION_DECORATOR_NAME,
  ON_DECORATOR_NAME,
  'observer',
]);

export const ACTION_SUPER_EXPRESSION_COMMENT = [
  ' TODO: This call to super is within an action, and has to refer to the parent',
  " class's actions to be safe. This should be refactored to call a normal method",
  ' on the parent class. If the parent class has not been converted to native',
  ' classes, it may need to be refactored as well. See',
  ' https://github.com/scalvert/ember-native-class-codemod/blob/master/README.md',
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
  ON_DECORATOR_NAME,
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
  ACTION_DECORATOR_NAME,
  COMPUTED_DECORATOR_NAME,

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
  OBSERVES_DECORATOR_NAME,
  ON_DECORATOR_NAME,
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

/** Convert the first letter to uppercase */
export function capitalizeFirstLetter(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}
