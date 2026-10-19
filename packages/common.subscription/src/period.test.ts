import { describe, expect, it } from 'vitest';
import { isSubscriptionPeriodActive } from './period';

const now = Date.parse('2026-10-17T12:00:00Z');

describe('isSubscriptionPeriodActive', () => {
  it('считает период действующим, пока ends_at в будущем', () => {
    expect(isSubscriptionPeriodActive('2026-10-17T12:00:01Z', now)).toBe(true);
  });

  it('не считает действующей подписку с ends_at в прошлом или без даты', () => {
    expect(isSubscriptionPeriodActive('2026-10-17T11:59:59Z', now)).toBe(false);
    expect(isSubscriptionPeriodActive('2026-10-17T12:00:00Z', now)).toBe(false);
    expect(isSubscriptionPeriodActive(null, now)).toBe(false);
    expect(isSubscriptionPeriodActive(undefined, now)).toBe(false);
    expect(isSubscriptionPeriodActive('not-a-date', now)).toBe(false);
  });
});
