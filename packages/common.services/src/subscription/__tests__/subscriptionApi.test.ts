import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  parseCurrentPlan,
  parseCurrentSubscription,
  subscriptionApiConfig,
  SubscriptionQueryKey,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { isProPaymentActivated } from '../paymentActivation';
import {
  createSubscriptionPayment,
  deleteCurrentAutoRenewal,
  getCurrentPlan,
  getCurrentSubscription,
} from '../subscriptionApi';

const axiosMock = vi.fn();

describe('subscription API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('строит URL текущего тарифа, подписки, хранилища, платежа и автопродления', () => {
    expect(subscriptionApiConfig[SubscriptionQueryKey.CurrentPlan].getUrl()).toContain(
      '/api/protected/subscription-service/users/current/plan/',
    );
    expect(subscriptionApiConfig[SubscriptionQueryKey.CurrentSubscription].getUrl()).toContain(
      '/api/protected/subscription-service/users/current/subscription/',
    );
    expect(subscriptionApiConfig[SubscriptionQueryKey.StorageUsage].getUrl()).toContain(
      '/api/protected/content-service/roles/tutor/storage-usage/',
    );
    expect(subscriptionApiConfig[SubscriptionQueryKey.CreatePayment].method).toBe('POST');
    expect(subscriptionApiConfig[SubscriptionQueryKey.DeleteAutoRenewal].method).toBe('DELETE');
  });

  it('GET plan не считает ошибку тарифом Базовый', async () => {
    axiosMock.mockRejectedValue(new Error('network'));
    await expect(getCurrentPlan()).rejects.toThrow('network');
  });

  it('GET subscription 404 — отсутствие подписки', async () => {
    axiosMock.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });
    await expect(getCurrentSubscription()).resolves.toBeNull();
  });

  it('GET subscription пробрасывает ошибку, которая не 404', async () => {
    axiosMock.mockRejectedValue(new Error('network'));
    await expect(getCurrentSubscription()).rejects.toThrow('network');
  });

  it('POST payment отправляет только period monthly', async () => {
    axiosMock.mockResolvedValue({
      data: {
        confirmation_url: 'https://yookassa.ru/checkout/test',
        payment: {
          id: 'pay-1',
          provider_payment_id: 'yk-1',
          created_at: '2026-09-29T00:00:00Z',
          amount_roubles: 1499,
          subscription_days: 30,
        },
      },
    });

    await createSubscriptionPayment();

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: { period: 'monthly' },
      }),
    );
  });

  it('DELETE auto-renewal 404 считается уже отключённым', async () => {
    axiosMock.mockRejectedValue({ isAxiosError: true, response: { status: 404 } });
    await expect(deleteCurrentAutoRenewal()).resolves.toBeUndefined();
  });

  it('не принимает тариф без kind', () => {
    expect(() =>
      parseCurrentPlan({ max_active_classrooms: 1, max_total_storage_bytes: 1 }),
    ).toThrow('Invalid CurrentPlan');
    expect(
      parseCurrentPlan({ kind: null, max_active_classrooms: 3, max_total_storage_bytes: 10 }),
    ).toEqual({
      kind: null,
      max_active_classrooms: 3,
      max_total_storage_bytes: 10,
    });
  });

  it('разбирает подписку без автопродления', () => {
    expect(
      parseCurrentSubscription({
        subscription: { plan_kind: 'pro', ends_at: '2026-10-29T00:00:00Z' },
        auto_renewal: null,
      }).auto_renewal,
    ).toBeNull();
  });
});

describe('isProPaymentActivated', () => {
  it('успех, если Про появился вместе с подпиской', () => {
    expect(
      isProPaymentActivated({
        planKind: 'pro',
        subscriptionEndsAt: '2026-10-29T00:00:00Z',
      }),
    ).toBe(true);
  });

  it('успех, если ends_at увеличился', () => {
    expect(
      isProPaymentActivated({
        planKind: 'pro',
        subscriptionEndsAt: '2026-11-29T00:00:00Z',
        previousSubscriptionEndsAt: '2026-10-29T00:00:00Z',
      }),
    ).toBe(true);
  });

  it('не считает оплату успешной, пока тариф не Про или срок не вырос', () => {
    expect(
      isProPaymentActivated({
        planKind: null,
        subscriptionEndsAt: '2026-11-29T00:00:00Z',
      }),
    ).toBe(false);
    expect(
      isProPaymentActivated({
        planKind: 'pro',
        subscriptionEndsAt: '2026-10-29T00:00:00Z',
        previousSubscriptionEndsAt: '2026-10-29T00:00:00Z',
      }),
    ).toBe(false);
  });
});
