import { matchingTargets, sameIdSet } from '../model/matching';
import { normalizeMultipleChoiceDefinition } from '../model/multipleChoice';
import type { ActivityAttempt, ActivityDefinition, ValidationResult } from '../model/types';
import { answersMatch } from './text';

function result(byItem: Record<string, boolean>): ValidationResult {
  const values = Object.values(byItem);
  return {
    correct: values.filter(Boolean).length,
    total: values.length,
    byItem,
  };
}

export function evaluateActivity(
  definition: ActivityDefinition,
  attempt: ActivityAttempt,
): ValidationResult {
  switch (definition.kind) {
    case 'gap-text': {
      const byItem: Record<string, boolean> = {};
      for (const gap of definition.gaps) {
        const placed = attempt.placements[gap.id];
        const value = attempt.values[gap.id] ?? '';
        byItem[gap.id] =
          gap.input === 'drag' ? placed === gap.id : answersMatch(value, gap.answers);
      }
      return result(byItem);
    }
    case 'matching': {
      const byItem: Record<string, boolean> = {};
      for (const left of definition.left) {
        const expected = matchingTargets(definition.pairs[left.id]);
        if (expected.length === 0) continue;
        if (definition.mode === 'drag') {
          byItem[left.id] = attempt.placements[left.id] === expected[0];
        } else {
          byItem[left.id] = sameIdSet(expected, matchingTargets(attempt.connections[left.id]));
        }
      }
      return result(byItem);
    }
    case 'sorting': {
      const byItem: Record<string, boolean> = {};
      for (const item of definition.items) {
        byItem[item.id] = attempt.placements[item.id] === item.categoryId;
      }
      return result(byItem);
    }
    case 'ordering': {
      const byItem: Record<string, boolean> = {};
      const expected = definition.items.map((item) => item.id);
      const actual = attempt.order.length ? attempt.order : expected;
      expected.forEach((id, index) => {
        byItem[id] = actual[index] === id;
      });
      return result(byItem);
    }
    case 'label-image': {
      const byItem: Record<string, boolean> = {};
      for (const hotspot of definition.hotspots) {
        byItem[hotspot.id] = attempt.placements[hotspot.id] === hotspot.id;
      }
      return result(byItem);
    }
    case 'multiple-choice': {
      const normalized = normalizeMultipleChoiceDefinition(definition);
      const selectedIds = normalized.options
        .filter((option) => attempt.selected[option.id])
        .map((option) => option.id);
      const correctIds = normalized.options
        .filter((option) => option.correct)
        .map((option) => option.id);

      if (correctIds.length === 0) {
        return { correct: 0, total: 1, byItem: {} };
      }

      if (!normalized.multiple) {
        const correctId = correctIds[0]!;
        const ok = selectedIds.length === 1 && selectedIds[0] === correctId;
        return {
          correct: ok ? 1 : 0,
          total: 1,
          byItem: { question: ok },
        };
      }

      // Несколько ответов: считаем только отмеченные правильные и ошибочно выбранные.
      const byItem: Record<string, boolean> = {};
      for (const option of normalized.options) {
        const selected = Boolean(attempt.selected[option.id]);
        if (!option.correct && !selected) continue;
        byItem[option.id] = option.correct ? selected : false;
      }
      return result(byItem);
    }
    case 'mystery-tiles': {
      const byItem: Record<string, boolean> = {};
      for (const tile of definition.tiles) {
        byItem[tile.id] = Boolean(attempt.revealed[tile.id]);
      }
      return result(byItem);
    }
    case 'random-card': {
      return { correct: attempt.drawnCount, total: definition.cards.length, byItem: {} };
    }
  }
}

export function hasCheckableAnswers(definition: ActivityDefinition): boolean {
  return definition.kind !== 'random-card' && definition.kind !== 'mystery-tiles';
}
