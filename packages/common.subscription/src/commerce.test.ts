import { describe, expect, it } from 'vitest';
import { canUseSubscriptionCommerce } from './commerce';

describe('canUseSubscriptionCommerce', () => {
  it('разрешает покупку и промокоды только временному списку аккаунтов', () => {
    expect(canUseSubscriptionCommerce(1)).toBe(true);
    expect(canUseSubscriptionCommerce(30)).toBe(true);
    expect(canUseSubscriptionCommerce(3701)).toBe(true);
    expect(canUseSubscriptionCommerce(8663)).toBe(true);
    expect(canUseSubscriptionCommerce(2)).toBe(false);
    expect(canUseSubscriptionCommerce(null)).toBe(false);
    expect(canUseSubscriptionCommerce(undefined)).toBe(false);
  });
});
