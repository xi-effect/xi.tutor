/** Перерыв достаточно большой, чтобы в него поместилось хотя бы одно занятие обычной длительности. */
export function canFitTypicalLesson(
  start: Date,
  end: Date,
  typicalDurationMinutes: number,
): boolean {
  if (typicalDurationMinutes <= 0) return false;
  const gapMinutes = (end.getTime() - start.getTime()) / 60_000;
  return gapMinutes >= typicalDurationMinutes;
}
