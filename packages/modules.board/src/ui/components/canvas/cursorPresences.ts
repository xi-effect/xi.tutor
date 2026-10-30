export type CursorPresence = {
  id: string;
  userId: string;
  lastActivityTimestamp?: number | null;
  cursor?: unknown;
  meta?: unknown;
};

export type CursorPresenceFilter = {
  myPresenceId?: string | null;
  myUserId?: string | null;
  myBackendUserId?: string | null;
};

function backendUserIdOf(presence: CursorPresence): string | null {
  const meta = presence.meta;
  if (!meta || typeof meta !== 'object') return null;
  const id = (meta as Record<string, unknown>).backendUserId;
  if (typeof id === 'number' && Number.isFinite(id)) return String(id);
  if (typeof id === 'string' && id.length > 0) return id;
  return null;
}

function isOwnPresence(presence: CursorPresence, filter: CursorPresenceFilter): boolean {
  if (filter.myPresenceId && presence.id === filter.myPresenceId) return true;
  if (filter.myUserId && presence.userId === filter.myUserId) return true;
  const backendId = backendUserIdOf(presence);
  return Boolean(filter.myBackendUserId && backendId === filter.myBackendUserId);
}

function isBetterCursor<T extends CursorPresence>(candidate: T, current: T): boolean {
  const candidateHasCursor = candidate.cursor != null;
  const currentHasCursor = current.cursor != null;
  if (candidateHasCursor !== currentHasCursor) return candidateHasCursor;
  return (candidate.lastActivityTimestamp ?? 0) >= (current.lastActivityTimestamp ?? 0);
}

/**
 * Свой курсор не показываем. Чужие instance_presence с одним backendUserId
 * (реконнект, вторая вкладка) схлопываем в один, самый свежий.
 */
export function selectCursorPresences<T extends CursorPresence>(
  presences: readonly T[],
  filter: CursorPresenceFilter,
): T[] {
  const byKey = new Map<string, T>();

  for (const presence of presences) {
    if (isOwnPresence(presence, filter)) continue;

    const backendId = backendUserIdOf(presence);
    const key = backendId ? `backend:${backendId}` : `user:${presence.userId}`;
    const current = byKey.get(key);
    if (!current || isBetterCursor(presence, current)) byKey.set(key, presence);
  }

  return [...byKey.values()];
}
