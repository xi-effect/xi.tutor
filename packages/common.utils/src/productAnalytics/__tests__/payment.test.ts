import { afterEach, describe, expect, it, vi } from 'vitest';
import { parsePaymentRevenue, trackPaymentConfirmed } from '../payment';

describe('parsePaymentRevenue', () => {
  it('принимает число и строку с пробелами и запятой', () => {
    expect(parsePaymentRevenue(1500)).toBe(1500);
    expect(parsePaymentRevenue('1 500,5')).toBe(1500.5);
    expect(parsePaymentRevenue('')).toBeNull();
    expect(parsePaymentRevenue(-1)).toBeNull();
    expect(parsePaymentRevenue(undefined)).toBeNull();
  });
});

describe('trackPaymentConfirmed', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete (globalThis as { window?: unknown }).window;
  });

  it('отправляет revenue и RUB только для завершённой оплаты', () => {
    vi.stubEnv('VITE_ENABLE_PRODUCT_ANALYTICS', 'true');
    const track = vi.fn();
    (globalThis as { window?: { umami?: { track: typeof track } } }).window = {
      umami: { track },
    };

    trackPaymentConfirmed('2 000', 'receiver');
    trackPaymentConfirmed('нет', 'unilateral');

    expect(track).toHaveBeenCalledTimes(1);
    expect(track.mock.calls[0]?.[0]).toBe('payment_confirmed');
    expect(track.mock.calls[0]?.[1]).toMatchObject({
      revenue: 2000,
      currency: 'RUB',
      confirmation: 'receiver',
    });
  });
});
