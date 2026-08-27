import type { ActivityAttempt, MatchingDefinition } from './types';

export function matchingTargets(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((id): id is string => typeof id === 'string' && id.length > 0);
  }
  if (typeof value === 'string' && value.length > 0) return [value];
  return [];
}

export function matchingPairs(definition: MatchingDefinition): Record<string, string[]> {
  return Object.fromEntries(
    definition.left.map((item) => [item.id, matchingTargets(definition.pairs[item.id])]),
  );
}

export function matchingConnections(attempt: ActivityAttempt): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(attempt.connections).map(([id, value]) => [id, matchingTargets(value)]),
  );
}

export function sameIdSet(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const set = new Set(left);
  return right.every((id) => set.has(id));
}

export function toggleMatchLink(
  map: Record<string, string[]>,
  leftId: string,
  rightId: string,
): Record<string, string[]> {
  const next: Record<string, string[]> = {};
  for (const [id, targets] of Object.entries(map)) {
    next[id] = targets.filter((targetId) => targetId !== rightId);
  }
  const current = next[leftId] ?? [];
  next[leftId] = current.includes(rightId)
    ? current.filter((targetId) => targetId !== rightId)
    : [...current, rightId];
  return next;
}

export function linkedRightIds(map: Record<string, string[]>) {
  return new Set(Object.values(map).flat());
}
