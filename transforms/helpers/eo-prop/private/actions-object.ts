import type { ObjectExpression, Property } from 'jscodeshift';
import type { RuntimeData } from '../../runtime-data';
import EOProp from './base';

export type ActionsObjectProperty = Property & { value: ObjectExpression };

/** Type predicate */
export function isEOActionsPropProperty(
  property: Property
): property is ActionsObjectProperty {
  return (
    property.value.type === 'ObjectExpression' &&
    'name' in property.key &&
    property.key.name === 'actions'
  );
}

export default class EOActionsObjectProp extends EOProp<ObjectExpression> {
  readonly overriddenActions: string[] = [];

  constructor(
    eoProp: ActionsObjectProperty,
    runtimeData: RuntimeData | undefined
  ) {
    super(eoProp, runtimeData);
    if (runtimeData?.overriddenActions) {
      this.overriddenActions = runtimeData.overriddenActions;
    }
  }
}
