import { getTelemetryFor } from 'ember-codemods-telemetry-helpers';
import path from 'path';
import { z } from 'zod';

const RuntimeDataSchema = z.object({
  type: z.string().optional(),
  computedProperties: z.array(z.string()).default([]),
  offProperties: z.record(z.array(z.string())).default({}),
  overriddenActions: z.array(z.string()).default([]),
  overriddenProperties: z.array(z.string()).default([]),
  unobservedProperties: z.record(z.array(z.string())).default({}),
});

export type RuntimeData = z.infer<typeof RuntimeDataSchema>;

/**
 * TODO
 */
export function getRuntimeData(filePath: string): RuntimeData {
  const rawTelemetry = getTelemetryFor(path.resolve(filePath));
  if (!rawTelemetry) {
    throw new RuntimeDataError('Could not find runtime data');
  }

  const result = RuntimeDataSchema.safeParse(rawTelemetry);
  if (result.success) {
    return result.data;
  } else {
    const { errors } = result.error;
    const messages = errors.map((error) => {
      return `[${error.path.join('.')}]: ${error.message}`;
    });
    throw new RuntimeDataError(
      `Could not parse runtime data: \n\t${messages.join('\n\t')}`
    );
  }
}

class RuntimeDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuntimeDataError';
  }
}
