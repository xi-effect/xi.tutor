import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackProductEvent } from '../umami';

describe('subscription analytics privacy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as { window?: unknown }).window;
  });

  it('вырезает промокод, ссылку оплаты и сырую причину отмены', () => {
    vi.stubEnv('VITE_ENABLE_PRODUCT_ANALYTICS', 'true');
    const track = vi.fn();
    (globalThis as { window?: { umami?: { track: typeof track } } }).window = {
      umami: { track },
    };

    const eventName = 'subscription_payment_returned';
    trackProductEvent(eventName, {
      result: 'failed',
      event_version: 1,
      promo_code: 'SECRET',
      confirmation_url: 'https://yookassa.ru/checkout',
      cancellation_reason: 'insufficient_funds',
      provider_payment_id: 'yk-1',
    });

    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0]?.[1]).toMatchObject({ result: 'failed' });
    expect(track.mock.calls[0]?.[1]).not.toHaveProperty('promo_code');
    expect(track.mock.calls[0]?.[1]).not.toHaveProperty('confirmation_url');
    expect(track.mock.calls[0]?.[1]).not.toHaveProperty('cancellation_reason');
    expect(track.mock.calls[0]?.[1]).not.toHaveProperty('provider_payment_id');
  });
});
