import { visualizationIntentSchema, type VisualizationIntent } from './schemas';

export type IntentValidationResult =
  { ok: true; intent: VisualizationIntent } | { ok: false; error: string };

function normalizeIntentInput(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  const record = input as Record<string, unknown>;
  if (record.type !== 'function_graph') return input;

  const expressions = Array.isArray(record.expressions)
    ? record.expressions
    : typeof record.expression === 'string'
      ? [record.expression]
      : [];

  return {
    ...record,
    expressions,
    expression: typeof record.expression === 'string' ? record.expression : expressions[0],
  };
}

export function validateVisualizationIntent(input: unknown): IntentValidationResult {
  const result = visualizationIntentSchema.safeParse(normalizeIntentInput(input));
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid visualization intent' };
  }
  return { ok: true, intent: result.data };
}
