import type { RuntimeData } from './runtime-data';

export interface UserOptions {
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
}

export interface PrivateOptions {
  /** @private */
  runtimeData: RuntimeData | undefined;
}

export type Options = UserOptions & PrivateOptions;

export const DEFAULT_OPTIONS: UserOptions = {
  decorators: true,
  classFields: true,
  classicDecorator: true,
  quote: 'single',
};
