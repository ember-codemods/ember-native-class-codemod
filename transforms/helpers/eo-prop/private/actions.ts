import type { EOAction, EOPropertyWithActionsObject } from '../../ast';
import AbstractEOProp from './abstract';

export default class EOActionsProp extends AbstractEOProp<EOPropertyWithActionsObject> {
  get value(): EOPropertyWithActionsObject['value'] {
    return this._prop.value;
  }

  get properties(): EOAction[] {
    return this.value.properties;
  }
}
