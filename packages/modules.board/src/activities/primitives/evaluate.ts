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
        const expected = definition.pairs[left.id];
        const actual =
          definition.mode === 'drag' ? attempt.placements[left.id] : attempt.connections[left.id];
        byItem[left.id] = Boolean(expected) && actual === expected;
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
      const byItem: Record<string, boolean> = {};
      for (const option of definition.options) {
        const selected = Boolean(attempt.selected[option.id]);
        byItem[option.id] = option.correct ? selected : !selected;
      }
      if (!definition.multiple) {
        const selectedIds = definition.options
          .filter((option) => attempt.selected[option.id])
          .map((option) => option.id);
        const correctIds = definition.options
          .filter((option) => option.correct)
          .map((option) => option.id);
        return {
          correct: selectedIds.length === 1 && selectedIds[0] === correctIds[0] ? 1 : 0,
          total: 1,
          byItem: { question: selectedIds.length === 1 && selectedIds[0] === correctIds[0] },
        };
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
