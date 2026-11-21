import { matchingPairs } from '../model/matching';
import { normalizeMultipleChoiceDefinition } from '../model/multipleChoice';
import { createEmptyAttempt } from '../model/defaults';
import type { ActivityAttempt, ActivityDefinition } from '../model/types';

export function resetAttempt(definition: ActivityDefinition): ActivityAttempt {
  return createEmptyAttempt(definition);
}

export function revealAttempt(
  definition: ActivityDefinition,
  attempt: ActivityAttempt,
): ActivityAttempt {
  const next: ActivityAttempt = {
    ...attempt,
    values: { ...attempt.values },
    selected: { ...attempt.selected },
    placements: { ...attempt.placements },
    connections: { ...attempt.connections },
    revealed: { ...attempt.revealed },
    optionOrder: [...attempt.optionOrder],
    bankOrder: [...attempt.bankOrder],
    order: [...attempt.order],
  };

  switch (definition.kind) {
    case 'gap-text':
      for (const gap of definition.gaps) {
        const answer = gap.answers[0] ?? '';
        if (gap.input === 'drag') next.placements[gap.id] = gap.id;
        else next.values[gap.id] = answer;
      }
      break;
    case 'matching': {
      const pairs = matchingPairs(definition);
      next.connections = pairs;
      next.placements = Object.fromEntries(
        Object.entries(pairs).map(([leftId, rightIds]) => [leftId, rightIds[0] ?? null]),
      );
      break;
    }
    case 'sorting':
      for (const item of definition.items) {
        next.placements[item.id] = item.categoryId;
      }
      break;
    case 'ordering':
      next.order = definition.items.map((item) => item.id);
      break;
    case 'label-image':
      for (const hotspot of definition.hotspots) {
        next.placements[hotspot.id] = hotspot.id;
      }
      break;
    case 'multiple-choice': {
      const normalized = normalizeMultipleChoiceDefinition(definition);
      next.selected = Object.fromEntries(
        normalized.options.map((option) => [option.id, option.correct]),
      );
      break;
    }
    case 'mystery-tiles':
      for (const tile of definition.tiles) {
        next.revealed[tile.id] = true;
      }
      break;
    case 'random-card':
      break;
    case 'exercise':
      next.revealed.answer = true;
      break;
  }

  return next;
}

export function exerciseAnswerIsOpen(
  definition: ActivityDefinition,
  attempt: ActivityAttempt,
  checkStatus: 'idle' | 'checked' | 'revealed',
): boolean {
  return (
    definition.kind === 'exercise' &&
    (checkStatus === 'revealed' || Boolean(attempt.revealed.answer))
  );
}

/** Повторный «показать ответ» у упражнения из банка прячет ответ, не затирая ввод ученика. */
export function toggleAnswerVisibility(
  definition: ActivityDefinition,
  attempt: ActivityAttempt,
  checkStatus: 'idle' | 'checked' | 'revealed',
): { attempt: ActivityAttempt; checkStatus: 'idle' | 'checked' | 'revealed' } {
  if (exerciseAnswerIsOpen(definition, attempt, checkStatus)) {
    const revealed = { ...attempt.revealed, answer: false };
    const nextStatus =
      checkStatus === 'revealed'
        ? attempt.values.answer?.trim()
          ? 'checked'
          : 'idle'
        : checkStatus;
    return { attempt: { ...attempt, revealed }, checkStatus: nextStatus };
  }

  return { attempt: revealAttempt(definition, attempt), checkStatus: 'revealed' };
}
