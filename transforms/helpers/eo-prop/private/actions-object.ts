import type { EOAction, EOPropertyWithActionsObject } from '../../ast';
import type { RuntimeData } from '../../runtime-data';
import AbstractEOProp from './abstract';

export default class EOActionsObjectProp extends AbstractEOProp<EOPropertyWithActionsObject> {
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

  get properties(): EOAction[] {
    return this._prop.value.properties;
  }
}
