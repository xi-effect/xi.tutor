import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import { resetTrackOnceKeys } from '../once';
import {
  mapSubscriptionCheckoutFailure,
  mapSubscriptionPaymentReturnResult,
  mapSubscriptionPromoFailure,
  mapSubscriptionRenewalFailure,
  observeSubscriptionLifecycle,
  resetSubscriptionAnalyticsForTests,
  trackSubscriptionCheckoutStarted,
  trackSubscriptionPaywallShown,
  trackSubscriptionPaymentRedirected,
  trackSubscriptionPlanSelected,
  trackConfirmedSubscriptionActivation,
} from '../subscriptionAnalytics';
import {
  getSubscriptionFlow,
  resetSubscriptionFlowForTests,
  setSubscriptionAnalyticsSource,
} from '../subscriptionFlow';
import { trackProductEvent } from '../umami';

vi.mock('../umami', () => ({
  trackProductEvent: vi.fn(),
}));

const trackMock = vi.mocked(trackProductEvent);

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, String(value));
    },
  };
}

const session = createMemoryStorage();
const local = createMemoryStorage();

describe('subscription analytics', () => {
  afterEach(() => {
    resetSubscriptionFlowForTests();
    resetSubscriptionAnalyticsForTests();
    resetTrackOnceKeys();
    session.clear();
    local.clear();
    trackMock.mockClear();
    delete (globalThis as { window?: unknown }).window;
  });

  function installWindow() {
    (globalThis as { window?: Window }).window = {
      sessionStorage: session,
      localStorage: local,
    } as Window;
  }

  it('держит один subscription_flow_id на попытку и выдаёт новый на следующую', () => {
    installWindow();
    setSubscriptionAnalyticsSource('settings');

    const first = trackSubscriptionPlanSelected({
      currentPlan: 'basic',
      targetPlan: 'pro',
      billingPeriod: 'month',
    });
    trackSubscriptionCheckoutStarted({
      currentPlan: 'basic',
      targetPlan: 'pro',
      billingPeriod: 'year',
      shouldAutoRenew: true,
    });
    trackSubscriptionPaymentRedirected();
    trackSubscriptionPaymentRedirected();

    const flow = getSubscriptionFlow();
    expect(flow?.id).toBe(first);
    expect(flow?.billingPeriod).toBe('year');
    expect(
      trackMock.mock.calls.filter((call) => call[0] === 'subscription_payment_redirected'),
    ).toHaveLength(1);

    const second = trackSubscriptionPlanSelected({
      currentPlan: 'basic',
      targetPlan: 'pro',
      billingPeriod: 'month',
    });
    expect(second).not.toBe(first);
  });

  it('не кладёт сырой ответ оплаты и промокод в reason', () => {
    expect(
      mapSubscriptionCheckoutFailure({ response: { status: 422, data: { detail: 'bad plan' } } }),
    ).toBe('invalid_plan');
    expect(mapSubscriptionCheckoutFailure({ response: { status: 409 } })).toBe(
      'already_subscribed',
    );
    expect(mapSubscriptionCheckoutFailure({ message: 'Network Error' })).toBe('network_error');
    expect(
      mapSubscriptionCheckoutFailure({
        response: { status: 500, data: { detail: 'yookassa down' } },
      }),
    ).toBe('payment_create_failed');

    expect(
      mapSubscriptionPaymentReturnResult({
        completed_at: null,
        cancellation_reason: 'insufficient_funds',
      }),
    ).toBe('failed');
    expect(
      mapSubscriptionPaymentReturnResult({
        completed_at: null,
        cancellation_reason: 'canceled_by_user',
      }),
    ).toBe('cancelled');
    expect(
      mapSubscriptionPaymentReturnResult({
        completed_at: '2026-01-01T00:00:00Z',
        cancellation_reason: null,
      }),
    ).toBe('success');

    expect(
      mapSubscriptionPromoFailure({ response: { status: 404, data: { detail: 'SECRET-CODE' } } }),
    ).toBe('invalid');
    expect(mapSubscriptionPromoFailure({ response: { status: 409 } })).toBe('already_used');
    expect(mapSubscriptionPromoFailure({ response: { data: { detail: 'expired' } } })).toBe(
      'expired',
    );
    expect(mapSubscriptionRenewalFailure('card declined by bank')).toBe('unknown');
    expect(mapSubscriptionRenewalFailure('insufficient_funds')).toBe('insufficient_funds');
  });

  it('активирует подписку один раз и только после редиректа в оплату', () => {
    installWindow();
    trackSubscriptionPlanSelected({
      currentPlan: 'basic',
      targetPlan: 'pro',
      billingPeriod: 'month',
    });
    trackConfirmedSubscriptionActivation({
      paymentId: 'pay-1',
      plan: 'pro',
      billingPeriod: 'month',
    });
    expect(
      trackMock.mock.calls.some(
        (call) => call[0] === PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
      ),
    ).toBe(false);

    trackSubscriptionPaymentRedirected();
    trackConfirmedSubscriptionActivation({
      paymentId: 'pay-1',
      plan: 'pro',
      billingPeriod: 'month',
    });
    trackConfirmedSubscriptionActivation({
      paymentId: 'pay-1',
      plan: 'pro',
      billingPeriod: 'month',
    });

    const activated = trackMock.mock.calls.filter(
      (call) => call[0] === PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
    );
    expect(activated).toHaveLength(1);
    expect(activated[0]?.[1]).toMatchObject({
      plan: 'pro',
      billing_period: 'month',
      activation_type: 'new',
      subscription_flow_id: expect.any(String),
    });
    expect(JSON.stringify(activated[0]?.[1])).not.toContain('pay-1');
  });

  it('не повторяет paywall одного и того же показа', () => {
    trackSubscriptionPaywallShown({ limitType: 'file_size', currentPlan: 'basic' }, 5_000);
    trackSubscriptionPaywallShown({ limitType: 'file_size', currentPlan: 'basic' }, 5_000);
    expect(trackMock).toHaveBeenCalledTimes(1);
  });

  it('отличает продление, промо и истечение по снимку backend', () => {
    installWindow();
    const userKey = '42';
    const active = {
      plan: 'pro',
      active: true,
      endsAt: '2026-01-01T00:00:00.000Z',
      billingPeriod: 'month' as const,
      autoRenew: true,
    };
    observeSubscriptionLifecycle(userKey, active);

    observeSubscriptionLifecycle(userKey, {
      ...active,
      endsAt: '2026-01-31T00:00:00.000Z',
    });
    expect(trackMock.mock.calls.map((call) => call[0])).toContain(
      PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_RENEWAL_SUCCEEDED,
    );
    expect(
      trackMock.mock.calls.some(
        (call) => call[0] === PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
      ),
    ).toBe(false);

    trackMock.mockClear();
    observeSubscriptionLifecycle(userKey, {
      plan: 'basic',
      active: false,
      endsAt: '2026-01-31T00:00:00.000Z',
      billingPeriod: null,
      autoRenew: false,
    });
    expect(trackMock.mock.calls.map((call) => call[0])).toEqual([
      PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_RENEWAL_FAILED,
      PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED,
      PRODUCT_ANALYTICS_EVENTS.SUBSCRIPTION_DOWNGRADED,
    ]);
    expect(trackMock.mock.calls[0]?.[1]).toMatchObject({ reason: 'unknown' });
    expect(trackMock.mock.calls[2]?.[1]).toMatchObject({
      previous_plan: 'pro',
      new_plan: 'basic',
      reason: 'payment_failed',
    });
  });
});
