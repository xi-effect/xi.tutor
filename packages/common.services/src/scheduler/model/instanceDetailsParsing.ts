import type { GetEventInstanceDetailsResponseDto } from 'common.api';

type PersistedSlot = {
  id?: string;
  cancelled_at?: string | null;
  starts_at?: string;
  ends_at?: string;
};

/** Плоские поля времени/слота из ответа GET event-instances/{id}/ (вложенный или legacy-плоский). */
export function extractInstanceSlot(
  details: GetEventInstanceDetailsResponseDto | Record<string, unknown>,
): {
  startsAt: string;
  endsAt: string;
  instanceId?: string;
  cancelledAt: string | null;
} | null {
  const raw = details as Record<string, unknown>;

  const persisted = raw.persisted_event_instance as PersistedSlot | undefined;
  if (
    persisted != null &&
    typeof persisted.starts_at === 'string' &&
    typeof persisted.ends_at === 'string'
  ) {
    return {
      startsAt: persisted.starts_at,
      endsAt: persisted.ends_at,
      instanceId: typeof persisted.id === 'string' ? persisted.id : undefined,
      cancelledAt: persisted.cancelled_at ?? null,
    };
  }

  const virtualInstance = raw.virtual_event_instance as PersistedSlot | undefined;
  if (
    virtualInstance != null &&
    typeof virtualInstance.starts_at === 'string' &&
    typeof virtualInstance.ends_at === 'string'
  ) {
    return {
      startsAt: virtualInstance.starts_at,
      endsAt: virtualInstance.ends_at,
      cancelledAt:
        typeof virtualInstance.cancelled_at === 'string' ? virtualInstance.cancelled_at : null,
    };
  }

  if (typeof raw.starts_at === 'string' && typeof raw.ends_at === 'string') {
    return {
      startsAt: raw.starts_at,
      endsAt: raw.ends_at,
      instanceId: typeof raw.id === 'string' ? raw.id : undefined,
      cancelledAt: (raw.cancelled_at as string | null) ?? null,
    };
  }

  return null;
}

export function normalizeEventInstanceDetailsResponse(
  details: GetEventInstanceDetailsResponseDto | undefined,
):
  | {
      name?: string;
      description: string | null;
      starts_at: string;
      ends_at: string;
    }
  | undefined {
  if (details == null) return undefined;

  const slot = extractInstanceSlot(details);
  if (slot == null) return undefined;

  const event =
    'event' in details && details.event != null
      ? details.event
      : {
          name:
            typeof (details as Record<string, unknown>).name === 'string'
              ? ((details as Record<string, unknown>).name as string)
              : '',
          description:
            typeof (details as Record<string, unknown>).description === 'string'
              ? ((details as Record<string, unknown>).description as string)
              : null,
        };

  return {
    name: event.name,
    description: event.description ?? null,
    starts_at: slot.startsAt,
    ends_at: slot.endsAt,
  };
}

export function readInstanceStartsAt(
  details: GetEventInstanceDetailsResponseDto,
): Date | undefined {
  const slot = extractInstanceSlot(details);
  if (slot == null) return undefined;
  const d = new Date(slot.startsAt);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

export function readInstanceIsCancelled(
  details: GetEventInstanceDetailsResponseDto | Record<string, unknown>,
): boolean {
  const slot = extractInstanceSlot(details);
  if (slot?.cancelledAt != null) return true;

  const raw = details as Record<string, unknown>;
  if (raw.is_cancelled === true) return true;

  const topCancelled = raw.cancelled_at;
  if (typeof topCancelled === 'string' && topCancelled.trim().length > 0) return true;

  const status = raw.status;
  if (typeof status === 'string' && /cancel/i.test(status)) return true;

  return false;
}
