import type { JsonValue, JsonObject } from './util/types';

export interface RuntimeData {
  type?: string;
  computedProperties?: JsonValue[];
  offProperties?: JsonObject;
  overriddenActions?: JsonValue[];
  overriddenProperties?: JsonValue[];
  unobservedProperties?: JsonObject;
}
