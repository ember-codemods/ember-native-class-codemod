import { z } from 'zod';

export const RuntimeDataSchema = z.object({
  type: z.string().optional(),
  computedProperties: z.array(z.string()).default([]),
  offProperties: z.record(z.array(z.string())).default({}),
  overriddenActions: z.array(z.string()).default([]),
  overriddenProperties: z.array(z.string()).default([]),
  unobservedProperties: z.record(z.array(z.string())).default({}),
});

export type RuntimeData = z.infer<typeof RuntimeDataSchema>;
