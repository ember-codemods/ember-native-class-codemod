import type { Identifier, ObjectExpression, Property } from 'jscodeshift';
import type { RuntimeData } from '../../runtime-data';
import AbstractEOProp from './abstract';

export type Action = Property & {
  key: Identifier;
};

type ActionsObjectExpression = ObjectExpression & {
  properties: Action[];
};

export type ActionsObjectProperty = Property & {
  value: ActionsObjectExpression;
  key: Identifier & { name: 'actions' };
};

/** Type predicate */
export function isEOActionsPropProperty(
  property: Property
): property is ActionsObjectProperty {
  return (
    property.value.type === 'ObjectExpression' &&
    'name' in property.key &&
    property.key.name === 'actions' &&
    property.value.properties.every(
      (p) => p.type === 'Property' && p.key.type === 'Identifier'
    )
  );
}

export default class EOActionsObjectProp extends AbstractEOProp<
  ActionsObjectExpression,
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

  get properties(): Action[] {
    return this._prop.value.properties;
  }
}
