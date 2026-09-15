import { describe, expect, it } from 'vitest';
import { normalizeMultipleChoiceDefinition } from '../multipleChoice';
import type { MultipleChoiceDefinition } from '../types';

function definition(
  partial: Partial<MultipleChoiceDefinition> &
    Pick<MultipleChoiceDefinition, 'multiple' | 'options'>,
): MultipleChoiceDefinition {
  return {
    kind: 'multiple-choice',
    question: 'Q',
    randomize: false,
    ...partial,
  };
}

describe('normalizeMultipleChoiceDefinition', () => {
  it('не меняет multiple-режим', () => {
    const input = definition({
      multiple: true,
      options: [
        { id: 'a', text: 'A', correct: false },
        { id: 'b', text: 'B', correct: false },
      ],
    });
    expect(normalizeMultipleChoiceDefinition(input)).toBe(input);
  });

  it('оставляет единственный correct без изменений', () => {
    const input = definition({
      multiple: false,
      options: [
        { id: 'a', text: 'A', correct: false },
        { id: 'b', text: 'B', correct: true },
      ],
    });
    expect(normalizeMultipleChoiceDefinition(input)).toBe(input);
  });

  it('при нескольких correct оставляет первый', () => {
    const input = definition({
      multiple: false,
      options: [
        { id: 'a', text: 'A', correct: true },
        { id: 'b', text: 'B', correct: true },
        { id: 'c', text: 'C', correct: false },
      ],
    });
    expect(normalizeMultipleChoiceDefinition(input).options.map((o) => o.correct)).toEqual([
      true,
      false,
      false,
    ]);
  });

  it('если correct нет — ставит первый вариант', () => {
    const input = definition({
      multiple: false,
      options: [
        { id: 'a', text: 'A', correct: false },
        { id: 'b', text: 'B', correct: false },
      ],
    });
    expect(normalizeMultipleChoiceDefinition(input).options.map((o) => o.correct)).toEqual([
      true,
      false,
    ]);
  });
});
