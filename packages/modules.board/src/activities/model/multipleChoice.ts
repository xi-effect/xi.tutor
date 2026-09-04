import type { MultipleChoiceDefinition } from './types';

/** В режиме одного ответа оставляем ровно один correct; если не было — первый вариант. */
export function normalizeMultipleChoiceDefinition(
  definition: MultipleChoiceDefinition,
): MultipleChoiceDefinition {
  if (definition.multiple) return definition;
  if (definition.options.length === 0) return definition;

  const correctIds = definition.options
    .filter((option) => option.correct)
    .map((option) => option.id);
  if (correctIds.length === 1) return definition;

  const keepId = correctIds[0] ?? definition.options[0]!.id;
  return {
    ...definition,
    options: definition.options.map((option) => ({
      ...option,
      correct: option.id === keepId,
    })),
  };
}
