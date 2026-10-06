import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSubscriptionPaymentStatus,
  parseCurrentPlan,
  parseCurrentSubscription,
  parseSubscriptionPayment,
  subscriptionApiConfig,
  SubscriptionQueryKey,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import {
  SubscriptionPaymentLookupError,
  createSubscriptionPayment,
  deleteCurrentAutoRenewal,
  getCurrentPlan,
  getCurrentSubscription,
  getSubscriptionPayment,
} from '../subscriptionApi';

const paymentBody = {
  id: 'pay-1',
  provider_payment_id: 'yk-1',
  created_at: '2026-09-29T00:00:00Z',
  amount_roubles: 1499,
  subscription_days: 30,
  confirmation_url: 'https://yookassa.ru/checkout/test',
  completed_at: null,
  cancellation_reason: null,
};

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
    expect(subscriptionApiConfig[SubscriptionQueryKey.GetPayment].getUrl('pay/1')).toContain(
      '/api/protected/subscription-service/users/current/payments/pay%2F1/',
    );
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

  it('POST payment отправляет только period monthly и читает плоский Payment', async () => {
    axiosMock.mockResolvedValue({ data: paymentBody });

    await expect(createSubscriptionPayment()).resolves.toEqual(paymentBody);

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: { period: 'monthly' },
      }),
    );
  });

  it('GET payment запрашивает конкретный платёж', async () => {
    axiosMock.mockResolvedValue({
      data: { ...paymentBody, completed_at: '2026-09-29T01:00:00Z' },
    });

    await expect(getSubscriptionPayment('pay-1')).resolves.toMatchObject({
      id: 'pay-1',
      completed_at: '2026-09-29T01:00:00Z',
    });
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining('/payments/pay-1/'),
      }),
    );
  });

  it('GET payment 404 и 403 не считаются статусом платежа', async () => {
    axiosMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
    await expect(getSubscriptionPayment('missing')).rejects.toBeInstanceOf(
      SubscriptionPaymentLookupError,
    );

    axiosMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 403 } });
    await expect(getSubscriptionPayment('foreign')).rejects.toMatchObject({ status: 403 });

    axiosMock.mockRejectedValueOnce(new Error('network'));
    await expect(getSubscriptionPayment('pay-1')).rejects.toThrow('network');
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

describe('getSubscriptionPaymentStatus', () => {
  it('различает pending, success и cancelled', () => {
    expect(getSubscriptionPaymentStatus(paymentBody)).toBe('pending');
    expect(
      getSubscriptionPaymentStatus({
        ...paymentBody,
        completed_at: '2026-09-29T01:00:00Z',
      }),
    ).toBe('success');
    expect(
      getSubscriptionPaymentStatus({
        ...paymentBody,
        completed_at: '2026-09-29T01:00:00Z',
        cancellation_reason: 'canceled_by_user',
      }),
    ).toBe('cancelled');
    expect(
      getSubscriptionPaymentStatus({
        ...paymentBody,
        cancellation_reason: 'canceled_by_user',
      }),
    ).toBe('cancelled');
  });

  it('пустые строки статуса считает отсутствующими', () => {
    expect(
      parseSubscriptionPayment({
        ...paymentBody,
        completed_at: '  ',
        cancellation_reason: '',
      }),
    ).toMatchObject({ completed_at: null, cancellation_reason: null });
  });
});
