import type { RuntimeData } from './runtime-data';

export interface Options {
  /** Enable/disable transformation using decorators */
  decorators: boolean;
  /** Enable/disable transformation using class fields */
  classFields: boolean;
  /** Enable/disable adding the [`@classic` decorator](https://github.com/pzuraq/ember-classic-decorator), which helps with transitioning Ember Octane */
  classicDecorator: boolean;
  /** Whether to use double or single quotes by default for new statements that are added during the codemod. */
  quote: 'single' | 'double';
  quotes?: 'single' | 'double';
  /** Apply transformation to only passed type. */
  type?: 'services' | 'routes' | 'components' | 'controllers';
  /** @private */
  runtimeData?: RuntimeData | undefined;
}

export const DEFAULT_OPTIONS: Options = {
  decorators: true,
  classFields: true,
  classicDecorator: true,
  quote: 'single',
};
