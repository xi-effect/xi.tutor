import { describe, expect, it } from 'vitest';
import { resolveSchedulerStartsAt } from '../resolveSchedulerStartsAt';
import { toLocalISOString } from '../dateTimezone';

describe('resolveSchedulerStartsAt', () => {
  it('возвращает валидный raw ISO как есть', () => {
    const raw = '2026-04-21T10:00:00+03:00';
    expect(resolveSchedulerStartsAt(raw, new Date('2026-01-01T00:00:00Z'))).toBe(raw);
  });

  it('для пустого/невалидного значения берёт toLocalISOString(fallback)', () => {
    const fallback = new Date(2026, 3, 21, 10, 0, 0);
    expect(resolveSchedulerStartsAt(null, fallback)).toBe(toLocalISOString(fallback));
    expect(resolveSchedulerStartsAt('   ', fallback)).toBe(toLocalISOString(fallback));
    expect(resolveSchedulerStartsAt('not-a-date', fallback)).toBe(toLocalISOString(fallback));
  });
});
