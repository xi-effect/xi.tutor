import { env } from 'common.env';
import { HttpMethod } from './config';

export type PlanKind = 'pro';

export type RenewalPeriod = 'monthly' | 'yearly';

/** DTO GET `/users/current/plan/`. `kind: null` — тариф Базовый. */
export type CurrentPlan = {
  kind: PlanKind | null;
  max_active_classrooms: number;
  max_total_storage_bytes: number;
};

export type CurrentSubscription = {
  subscription: {
    plan_kind: PlanKind;
    ends_at: string;
  };
  auto_renewal: {
    renewal_period: RenewalPeriod;
  } | null;
};

export type StorageUsage = {
  total_storage_bytes: number;
};

export type CreateSubscriptionPaymentBody = {
  period: RenewalPeriod;
};

export type SubscriptionPayment = {
  id: string;
  provider_payment_id: string;
  created_at: string;
  amount_roubles: number;
  subscription_days: number;
  completed_at?: string | null;
  cancellation_reason?: string | null;
};

export type CreateSubscriptionPaymentResponse = {
  payment: SubscriptionPayment;
  confirmation_url: string;
};

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const optionalNullableString = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || typeof value === 'string') return value;
  throw new Error('Invalid subscription payload');
};

export const parseCurrentPlan = (data: unknown): CurrentPlan => {
  if (!isRecord(data)) {
    throw new Error('Invalid CurrentPlan');
  }

  const { kind, max_active_classrooms, max_total_storage_bytes } = data;

  if (kind !== null && kind !== 'pro') {
    throw new Error('Invalid CurrentPlan');
  }

  if (!isFiniteNumber(max_active_classrooms) || !isFiniteNumber(max_total_storage_bytes)) {
    throw new Error('Invalid CurrentPlan');
  }

  return {
    kind,
    max_active_classrooms,
    max_total_storage_bytes,
  };
};

export const parseCurrentSubscription = (data: unknown): CurrentSubscription => {
  if (!isRecord(data) || !isRecord(data.subscription)) {
    throw new Error('Invalid CurrentSubscription');
  }

  const { plan_kind, ends_at } = data.subscription;

  if (plan_kind !== 'pro' || typeof ends_at !== 'string' || ends_at.length === 0) {
    throw new Error('Invalid CurrentSubscription');
  }

  if (data.auto_renewal !== null && !isRecord(data.auto_renewal)) {
    throw new Error('Invalid CurrentSubscription');
  }

  let auto_renewal: CurrentSubscription['auto_renewal'] = null;

  if (isRecord(data.auto_renewal)) {
    const period = data.auto_renewal.renewal_period;
    if (period !== 'monthly' && period !== 'yearly') {
      throw new Error('Invalid CurrentSubscription');
    }
    auto_renewal = { renewal_period: period };
  }

  return {
    subscription: {
      plan_kind,
      ends_at,
    },
    auto_renewal,
  };
};

export const parseStorageUsage = (data: unknown): StorageUsage => {
  if (!isRecord(data) || !isFiniteNumber(data.total_storage_bytes)) {
    throw new Error('Invalid StorageUsage');
  }

  return { total_storage_bytes: data.total_storage_bytes };
};

export const parseCreateSubscriptionPaymentResponse = (
  data: unknown,
): CreateSubscriptionPaymentResponse => {
  if (!isRecord(data) || !isRecord(data.payment) || typeof data.confirmation_url !== 'string') {
    throw new Error('Invalid CreateSubscriptionPaymentResponse');
  }

  const payment = data.payment;

  if (
    typeof payment.id !== 'string' ||
    payment.id.length === 0 ||
    typeof payment.provider_payment_id !== 'string' ||
    typeof payment.created_at !== 'string' ||
    !isFiniteNumber(payment.amount_roubles) ||
    !isFiniteNumber(payment.subscription_days)
  ) {
    throw new Error('Invalid CreateSubscriptionPaymentResponse');
  }

  return {
    confirmation_url: data.confirmation_url,
    payment: {
      id: payment.id,
      provider_payment_id: payment.provider_payment_id,
      created_at: payment.created_at,
      amount_roubles: payment.amount_roubles,
      subscription_days: payment.subscription_days,
      completed_at: optionalNullableString(payment.completed_at),
      cancellation_reason: optionalNullableString(payment.cancellation_reason),
    },
  };
};

enum SubscriptionQueryKey {
  CurrentPlan = 'currentPlan',
  CurrentSubscription = 'currentSubscription',
  StorageUsage = 'storageUsage',
  CreatePayment = 'CreateSubscriptionPayment',
  DeleteAutoRenewal = 'DeleteAutoRenewal',
}

const subscriptionApiConfig = {
  [SubscriptionQueryKey.CurrentPlan]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/subscription-service/users/current/plan/`,
    method: HttpMethod.GET,
  },
  [SubscriptionQueryKey.CurrentSubscription]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/subscription-service/users/current/subscription/`,
    method: HttpMethod.GET,
  },
  [SubscriptionQueryKey.StorageUsage]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service/roles/tutor/storage-usage/`,
    method: HttpMethod.GET,
  },
  [SubscriptionQueryKey.CreatePayment]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/subscription-service/users/current/payments/`,
    method: HttpMethod.POST,
  },
  [SubscriptionQueryKey.DeleteAutoRenewal]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/subscription-service/users/current/auto-renewal/`,
    method: HttpMethod.DELETE,
  },
};

const subscriptionQueryKeys = {
  currentPlan: (userId: number) => [SubscriptionQueryKey.CurrentPlan, userId] as const,
  currentSubscription: (userId: number) =>
    [SubscriptionQueryKey.CurrentSubscription, userId] as const,
  storageUsage: (userId: number) => [SubscriptionQueryKey.StorageUsage, userId] as const,
};

export { subscriptionApiConfig, SubscriptionQueryKey, subscriptionQueryKeys };
