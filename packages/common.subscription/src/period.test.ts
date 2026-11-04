import { describe, expect, it } from 'vitest';
import {
  isSubscriptionExpiryNoticeDue,
  isSubscriptionPeriodActive,
  SUBSCRIPTION_EXPIRY_NOTICE_WINDOW_MS,
} from './period';

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

describe('isSubscriptionExpiryNoticeDue', () => {
  const endsAt = new Date(now + SUBSCRIPTION_EXPIRY_NOTICE_WINDOW_MS).toISOString();

  it('показывает предупреждение в последние 72 часа без автопродления', () => {
    expect(isSubscriptionExpiryNoticeDue(endsAt, false, now)).toBe(true);
    expect(
      isSubscriptionExpiryNoticeDue(
        new Date(now + SUBSCRIPTION_EXPIRY_NOTICE_WINDOW_MS - 1).toISOString(),
        false,
        now,
      ),
    ).toBe(true);
  });

  it('не показывает предупреждение раньше 72 часов, после окончания и с автопродлением', () => {
    expect(
      isSubscriptionExpiryNoticeDue(
        new Date(now + SUBSCRIPTION_EXPIRY_NOTICE_WINDOW_MS + 1).toISOString(),
        false,
        now,
      ),
    ).toBe(false);
    expect(isSubscriptionExpiryNoticeDue(new Date(now).toISOString(), false, now)).toBe(false);
    expect(isSubscriptionExpiryNoticeDue(new Date(now - 1).toISOString(), false, now)).toBe(false);
    expect(isSubscriptionExpiryNoticeDue(endsAt, true, now)).toBe(false);
    expect(isSubscriptionExpiryNoticeDue(null, false, now)).toBe(false);
    expect(isSubscriptionExpiryNoticeDue('not-a-date', false, now)).toBe(false);
  });
});
