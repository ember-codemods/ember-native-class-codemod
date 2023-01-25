import type {
  EOActionMethod,
  EOActionProperty,
  EOPropertyWithActionsObject,
} from '../../ast';
import type { RuntimeData } from '../../runtime-data';
import AbstractEOProp from './abstract';

export default class EOActionsProp extends AbstractEOProp<EOPropertyWithActionsObject> {
  readonly overriddenActions: string[] = [];

  constructor(
    eoProp: EOPropertyWithActionsObject,
    runtimeData: RuntimeData | undefined
  ) {
    super(eoProp, runtimeData);
    if (runtimeData?.overriddenActions) {
      this.overriddenActions = runtimeData.overriddenActions;
    }
  }

  get value(): EOPropertyWithActionsObject['value'] {
    return this._prop.value;
  }

  get properties(): Array<EOActionMethod | EOActionProperty> {
    return this.value.properties;
  }
}
