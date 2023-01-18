import type {
  ASTPath,
  Collection,
  Declaration,
  JSCodeshift,
  Property,
} from 'jscodeshift';
import { assert, isRecord, verified } from './types';

export const LAYOUT_DECORATOR_NAME = 'layout' as const;
export const LAYOUT_DECORATOR_LOCAL_NAME = 'templateLayout' as const;

export interface DecoratorPathInfo {
  readonly importPropDecoratorMap?: Record<string, string>;
  readonly decoratorPath: string;
}

export const DECORATOR_PATHS: Record<string, DecoratorPathInfo> = {
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
};

export const DECORATOR_PATH_OVERRIDES: Record<string, string> = {
  observes: '@ember-decorators/object',
};

export const EMBER_DECORATOR_SPECIFIERS: Record<string, string[]> = {
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
};

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
];

/**
 * Get a property from and object, useful to get nested props without checking
 * for null values
 *
 * @deprecated
 */
export function get(obj: object, path: string): unknown {
  return (
    path
      .split('.')
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce<object | null | undefined>(function (currentObject, pathSegment) {
        return currentObject === undefined || currentObject === null
          ? currentObject
          : currentObject[pathSegment as keyof typeof currentObject];
      }, obj)
  );
}

/**
 * Get a property from an object. Useful to get nested props on `any` types.
 */
export function dig<T>(
  obj: unknown,
  path: string,
  condition: (value: unknown) => value is T,
  message?: string
): T {
  const segments = path.split('.');
  let current: unknown = obj;
  for (const segment of segments) {
    current = verified(current, isRecord)[segment];
  }
  return verified(current, condition, message);
}

/** Get the first declaration in the program */
export function getFirstDeclaration(
  j: JSCodeshift,
  root: Collection<unknown>
): Collection<Declaration> {
  const path = root.find(j.Declaration).at(0).get() as ASTPath;
  return j(path) as Collection<Declaration>;
}

// FIXME: Remove and add name getter to each of the prop types
/** Return name of the property */
export function getPropName(prop: Property): string {
  const key = prop.key;
  assert('name' in key, 'expected name in prop.key');
  const name = key.name;
  assert(typeof name === 'string', 'expected name to be a string');
  return name;
}

/** Convert the first letter to uppercase */
export function capitalizeFirstLetter(name: string): string {
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
}

/** Returns true if the first character in the word is uppercase */
export function startsWithUpperCaseLetter(word = ''): boolean {
  return !!word && !word.startsWith(word.charAt(0).toLowerCase());
}
