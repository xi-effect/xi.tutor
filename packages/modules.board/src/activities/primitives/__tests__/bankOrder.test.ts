import { describe, expect, it } from 'vitest';
import { createEmptyAttempt, getDefaultDefinition } from '../../model/defaults';
import { gapDragTokens, resolveBankOrder, shuffleGapAttempt, syncAttemptOrder } from '../bankOrder';
import { shuffleWithSeed } from '../randomize';

describe('resolveBankOrder', () => {
  it('оставляет готовый порядок, если в нём ровно текущие id', () => {
    expect(resolveBankOrder(['a', 'b', 'c'], ['c', 'a', 'b'], 1)).toEqual(['c', 'a', 'b']);
  });

  it('перемешивает фишки пропусков, если в попытке лежат тексты ответов', () => {
    const ids = ['g1', 'g2', 'g3', 'g4'];
    const stored = ['いきました', 'およぎました', 'あつい', 'おいしい'];
    expect(resolveBankOrder(ids, stored, 7)).toEqual(shuffleWithSeed(ids, 7));
    expect(new Set(resolveBankOrder(ids, stored, 7))).toEqual(new Set(ids));
  });

  it('показывает новый элемент правой колонки и сохраняет порядок старых', () => {
    const definition = getDefaultDefinition('matching');
    if (definition.kind !== 'matching') throw new Error('kind');
    const attempt = createEmptyAttempt(definition, 3);
    const extra = 'extra-right';
    const expected = [...definition.right.map((item) => item.id), extra];
    const order = resolveBankOrder(expected, attempt.bankOrder, attempt.seed);

    expect(new Set(order)).toEqual(new Set(expected));
    const previous = attempt.bankOrder.filter((id) => expected.includes(id));
    expect(previous.every((id) => order.includes(id))).toBe(true);
    const positions = previous.map((id) => order.indexOf(id));
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
  });
});

describe('syncAttemptOrder', () => {
  it('записывает перемешанные id фишек вместо текстов ответов', () => {
    const definition = getDefaultDefinition('gap-text');
    if (definition.kind !== 'gap-text') throw new Error('kind');
    definition.gaps[0] = { ...definition.gaps[0]!, input: 'drag', answers: ['cat'] };
    definition.bank = ['dog'];
    const attempt = createEmptyAttempt(definition, 4);
    attempt.bankOrder = ['cat', 'dog'];

    const next = syncAttemptOrder(definition, attempt);
    const ids = gapDragTokens(definition).map((token) => token.id);
    expect(next.bankOrder).toEqual(shuffleWithSeed(ids, attempt.seed));
    expect(syncAttemptOrder(definition, next)).toBe(next);
  });

  it('не трогает попытку другого типа', () => {
    const definition = getDefaultDefinition('ordering');
    const attempt = createEmptyAttempt(definition, 2);
    expect(syncAttemptOrder(definition, attempt)).toBe(attempt);
  });
});

describe('shuffleGapAttempt', () => {
  it('перемешивает фишки пропуска и пропускает упражнение без них', () => {
    const definition = getDefaultDefinition('gap-text');
    if (definition.kind !== 'gap-text') throw new Error('kind');
    definition.gaps = [
      { id: 'g1', answers: ['a'], input: 'drag', choices: [] },
      { id: 'g2', answers: ['b'], input: 'drag', choices: [] },
    ];
    definition.bank = [];
    const attempt = createEmptyAttempt(definition, 1);
    const next = shuffleGapAttempt(definition, attempt);
    expect(next).not.toBeNull();
    expect(new Set(next!.bankOrder)).toEqual(new Set(['g1', 'g2']));
    expect(next!.values).toEqual(attempt.values);
    expect(shuffleGapAttempt(getDefaultDefinition('ordering'), attempt)).toBeNull();
  });
});

describe('createEmptyAttempt gap-text', () => {
  it('сохраняет id фишек, а не тексты ответов', () => {
    const definition = getDefaultDefinition('gap-text');
    if (definition.kind !== 'gap-text') throw new Error('kind');
    definition.gaps[0] = { ...definition.gaps[0]!, input: 'drag', answers: ['cat'] };
    definition.bank = ['mat'];
    const attempt = createEmptyAttempt(definition, 9);
    const ids = gapDragTokens(definition).map((token) => token.id);
    expect(attempt.bankOrder).toEqual(shuffleWithSeed(ids, 9));
  });
});
