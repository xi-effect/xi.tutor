import { DemoCabinetError } from './errors';

const idFrom = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.id === 'string' && record.id.trim()) return record.id;
  if (typeof record.id === 'number' && Number.isFinite(record.id)) return String(record.id);
  return null;
};

/** Идентификатор из тела ответа. Поддерживает и сущность, и обёртку `{ data }`. */
export const readCreatedId = (payload: unknown): string => {
  const direct = idFrom(payload);
  if (direct) return direct;

  const nested =
    payload && typeof payload === 'object' ? (payload as { data?: unknown }).data : undefined;
  const nestedId = idFrom(nested);
  if (nestedId) return nestedId;

  throw new DemoCabinetError('missing-id');
};
