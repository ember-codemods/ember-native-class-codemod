import type { Identifier, ObjectExpression, Property } from 'jscodeshift';
import type { RuntimeData } from '../../runtime-data';
import AbstractEOProp from './abstract';

export type ActionsObjectProperty = Property & {
  value: ObjectExpression;
  key: Identifier;
};

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

export default class EOActionsObjectProp extends AbstractEOProp<
  ObjectExpression,
  ActionsObjectProperty
> {
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

  get properties(): ObjectExpression['properties'] {
    return this._prop.value.properties;
  }
}
