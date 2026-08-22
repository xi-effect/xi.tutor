import { describe, expect, it } from 'vitest';
import { createEmptyAttempt, getDefaultDefinition } from '../../model/defaults';
import { evaluateActivity } from '../evaluate';
import { revealAttempt, resetAttempt } from '../reset';
import { answersMatch, parseGapSourceText } from '../text';
import { shuffleWithSeed } from '../randomize';

describe('answersMatch', () => {
  it('игнорирует регистр и лишние пробелы, принимает любой из вариантов', () => {
    expect(answersMatch('  Cat ', ['cat', 'kitty'])).toBe(true);
    expect(answersMatch('dog', ['cat'])).toBe(false);
  });
});

describe('parseGapSourceText', () => {
  it('режет текст на сегменты по {{id}}', () => {
    expect(parseGapSourceText('A {{g1}} B')).toEqual([
      { type: 'text', text: 'A ' },
      { type: 'gap', id: 'g1' },
      { type: 'text', text: ' B' },
    ]);
  });
});

describe('shuffleWithSeed', () => {
  it('стабилен для одного seed', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(shuffleWithSeed(items, 7)).toEqual(shuffleWithSeed(items, 7));
    expect(shuffleWithSeed(items, 7)).not.toEqual(shuffleWithSeed(items, 8));
  });
});

describe('evaluateActivity', () => {
  it('проверяет пропуски и несколько ответов', () => {
    const definition = getDefaultDefinition('gap-text');
    if (definition.kind !== 'gap-text') throw new Error('kind');
    const gap = definition.gaps[0]!;
    const attempt = createEmptyAttempt(definition, 1);
    expect(evaluateActivity(definition, attempt).correct).toBe(0);
    attempt.values[gap.id] = 'CAT';
    expect(evaluateActivity(definition, attempt)).toMatchObject({ correct: 1, total: 1 });
  });

  it('проверяет matching по парам', () => {
    const definition = getDefaultDefinition('matching');
    if (definition.kind !== 'matching') throw new Error('kind');
    const leftId = definition.left[0]!.id;
    const attempt = createEmptyAttempt(definition, 1);
    attempt.connections[leftId] = definition.pairs[leftId] ?? null;
    const scored = evaluateActivity(definition, attempt);
    expect(scored.byItem[leftId]).toBe(true);
    expect(scored.total).toBe(2);
  });

  it('проверяет категории и порядок', () => {
    const sorting = getDefaultDefinition('sorting');
    if (sorting.kind !== 'sorting') throw new Error('kind');
    const sortingAttempt = createEmptyAttempt(sorting, 1);
    for (const item of sorting.items) sortingAttempt.placements[item.id] = item.categoryId;
    expect(evaluateActivity(sorting, sortingAttempt).correct).toBe(sorting.items.length);

    const ordering = getDefaultDefinition('ordering');
    if (ordering.kind !== 'ordering') throw new Error('kind');
    const revealed = revealAttempt(ordering, createEmptyAttempt(ordering, 1));
    expect(evaluateActivity(ordering, revealed).correct).toBe(ordering.items.length);
  });

  it('проверяет single choice как 0/1', () => {
    const definition = getDefaultDefinition('multiple-choice');
    if (definition.kind !== 'multiple-choice') throw new Error('kind');
    const correct = definition.options.find((option) => option.correct)!;
    const attempt = createEmptyAttempt(definition, 1);
    attempt.selected[correct.id] = true;
    expect(evaluateActivity(definition, attempt)).toMatchObject({ correct: 1, total: 1 });
  });

  it('сброс очищает ответы', () => {
    const definition = getDefaultDefinition('gap-text');
    const revealed = revealAttempt(definition, createEmptyAttempt(definition, 1));
    expect(evaluateActivity(definition, revealed).correct).toBeGreaterThan(0);
    expect(evaluateActivity(definition, resetAttempt(definition)).correct).toBe(0);
  });
});
