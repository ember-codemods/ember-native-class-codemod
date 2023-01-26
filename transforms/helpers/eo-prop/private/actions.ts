import type {
  EOActionMethod,
  EOActionProperty,
  EOPropertyWithActionsObject,
} from '../../ast';
import AbstractEOProp from './abstract';

export default class EOActionsProp extends AbstractEOProp<EOPropertyWithActionsObject> {
  get value(): EOPropertyWithActionsObject['value'] {
    return this._prop.value;
  }

  get properties(): Array<EOActionMethod | EOActionProperty> {
    return this.value.properties;
  }
}
