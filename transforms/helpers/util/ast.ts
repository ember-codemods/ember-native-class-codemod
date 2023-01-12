import type { ObjectExpression } from 'jscodeshift';

type ObjectExpressionProp = ObjectExpression['properties'][number];

export type EOExpressionProp = Extract<ObjectExpressionProp, { value: unknown }>;
