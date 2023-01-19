import { isRecord } from './util/types';

export interface RuntimeData {
  type?: string;
  computedProperties?: string[];
  offProperties?: Record<string, Array<string | boolean | number | null>>;
  overriddenActions?: string[];
  overriddenProperties?: string[];
  unobservedProperties?: Record<
    string,
    Array<string | boolean | number | null>
  >;
}

/** Type predicate */
export function isRuntimeData(v: unknown): v is RuntimeData | undefined {
  return v === undefined || isRecord(v);
}
