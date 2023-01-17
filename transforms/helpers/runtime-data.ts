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
