import {
  getTelemetry,
  getTelemetryFor,
} from 'ember-codemods-telemetry-helpers';
import { GlobSync } from 'glob';
import path from 'node:path';
import { z } from 'zod';
import logger from './log-helper';
import { type UserOptions } from './options';

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
 * Gets telemetry data for the file and parses it into a valid `RuntimeData`
 * object.
 */
export function getRuntimeData(
  filePath: string,
  { moduleRoot, packageBase }: UserOptions
): RuntimeData {
  let rawTelemetry = getTelemetryFor(path.resolve(filePath));

  // FIXME: use either moduleRoot or packageBase??
  if (!rawTelemetry && moduleRoot && packageBase) {
    const modulePath = getModulePathFor(path.resolve(filePath), {
      moduleRoot,
      packageBase,
    });
    const moduleKey = generateModuleKey(modulePath);
    rawTelemetry = getTelemetry()[moduleKey];
  }

  if (!rawTelemetry) {
    // Do not re-throw. The most likely reason this happened was because
    // the user's app threw an error. We still want the codemod to work if so.
    logger.error({
      filePath,
      error: new RuntimeDataError('Could not find runtime data'),
    });
    rawTelemetry = {};
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

/**
 * Transforms a literal "on disk" path to a "module path".
 *
 * @param filePath the path on disk (from current working directory)
 * @returns The in-browser module path for the specified filePath
 */
function getModulePathFor(
  filePath: string,
  { moduleRoot, packageBase }: { moduleRoot: string; packageBase: string }
): string {
  const rootPaths = new GlobSync(`**/${packageBase}`, {
    ignore: ['**/tmp/**', '**/node_modules/**'],
    absolute: true,
  }).found;

  let bestMatch = '';
  let relativePath;

  for (const rootPath of rootPaths) {
    if (filePath.startsWith(rootPath) && rootPath.length > bestMatch.length) {
      bestMatch = rootPath;
      relativePath = filePath.slice(
        rootPath.length + 1 /* for slash */,
        -path.extname(filePath).length
      );
    }
  }

  if (relativePath) {
    return `${moduleRoot}/${relativePath}`;
  }

  // FIXME: Better error
  throw new Error('Could not determine module path');
}

function generateModuleKey(modulePath: string): string {
  const moduleKey = modulePath.replace('templates/components/', 'components/');
  // If `templates/` still exists in the path then it wasn't a component but a controller-level template instead
  return moduleKey.replace('templates/', 'controllers/');
}
