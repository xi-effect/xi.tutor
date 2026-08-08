/**
 * Для POST .../events/{id}/cancellations/ API отменяет вхождения строго ПОСЛЕ `starts_at`.
 * Чтобы включить текущее вхождение, передаём начало его календарного дня
 * в том же формате (UTC-Z или с offset), что и у вхождения.
 */
export function buildRepeatingCancellationStartsAt(occurrenceStartsAt: string): string | null {
  const raw = occurrenceStartsAt.trim();
  if (raw.length === 0) return null;

  const tIndex = raw.indexOf('T');
  if (tIndex === -1) return null;

  const datePart = raw.slice(0, tIndex);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const suffixMatch = raw.match(/(Z|[+-]\d{2}:\d{2})$/);
  const suffix = suffixMatch?.[1] ?? 'Z';

  return `${datePart}T00:00:00${suffix}`;
}
