import type { JsonArray } from './util/types';

export interface RuntimeData {
  type?: string;
  computedProperties?: JsonArray;
  offProperties?: Record<string, Array<string | boolean | number | null>>;
  overriddenActions?: string[];
  overriddenProperties?: JsonArray;
  unobservedProperties?: Record<
    string,
    Array<string | boolean | number | null>
  >;
}
