import type { ActivityAttempt, ActivityDefinition, GapTextDefinition } from '../model/types';
import { createSeed, mulberry32, shuffleWithSeed } from './randomize';

export type GapDragToken = { id: string; label: string };

export function gapDragTokens(definition: GapTextDefinition): GapDragToken[] {
  return [
    ...definition.gaps
      .filter((gap) => gap.input === 'drag')
      .map((gap) => ({ id: gap.id, label: gap.answers[0] ?? gap.id })),
    ...definition.bank.map((word, index) => ({ id: `bank-${index}`, label: word })),
  ];
}

function sameOrder(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

/**
 * Порядок банка в попытке снимается один раз и не знает о элементах,
 * добавленных позже. Если набор id разошёлся с заданием, старые позиции
 * сохраняются, а новые вставляются в случайные места. Пустой или чужой
 * порядок (например, тексты ответов вместо id) перемешивается целиком.
 */
export function resolveBankOrder(
  expectedIds: readonly string[],
  storedOrder: readonly string[],
  seed: number,
): string[] {
  const expected = new Set(expectedIds);
  const kept: string[] = [];
  const seen = new Set<string>();
  for (const id of storedOrder) {
    if (!expected.has(id) || seen.has(id)) continue;
    seen.add(id);
    kept.push(id);
  }
  if (kept.length === expectedIds.length) return kept;

  const missing = expectedIds.filter((id) => !seen.has(id));
  if (kept.length === 0) return shuffleWithSeed(expectedIds, seed);

  const result = [...kept];
  const rand = mulberry32(seed ^ result.length ^ missing.length);
  for (const id of shuffleWithSeed(missing, seed)) {
    const index = Math.floor(rand() * (result.length + 1));
    result.splice(index, 0, id);
  }
  return result;
}

function expectedBankIds(definition: ActivityDefinition): string[] | null {
  if (definition.kind === 'matching') return definition.right.map((item) => item.id);
  if (definition.kind === 'gap-text') return gapDragTokens(definition).map((token) => token.id);
  return null;
}

export function shuffleGapAttempt(
  definition: ActivityDefinition,
  attempt: ActivityAttempt,
): ActivityAttempt | null {
  if (definition.kind !== 'gap-text') return null;
  const ids = gapDragTokens(definition).map((token) => token.id);
  if (ids.length < 2) return null;
  const seed = createSeed();
  return { ...attempt, seed, bankOrder: shuffleWithSeed(ids, seed) };
}

export function syncAttemptOrder(
  definition: ActivityDefinition,
  attempt: ActivityAttempt,
): ActivityAttempt {
  const expected = expectedBankIds(definition);
  if (!expected) return attempt;
  const bankOrder = resolveBankOrder(expected, attempt.bankOrder, attempt.seed);
  if (sameOrder(bankOrder, attempt.bankOrder)) return attempt;
  return { ...attempt, bankOrder };
}
