import {
  parseCreateSubscriptionPaymentResponse,
  parseCurrentPlan,
  parseCurrentSubscription,
  parseStorageUsage,
  subscriptionApiConfig,
  SubscriptionQueryKey,
  type CreateSubscriptionPaymentResponse,
  type CurrentPlan,
  type CurrentSubscription,
  type StorageUsage,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { isAxiosError } from 'axios';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

export async function getCurrentPlan(): Promise<CurrentPlan> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = subscriptionApiConfig[SubscriptionQueryKey.CurrentPlan];

  const response = await axiosInst({
    method,
    url: getUrl(),
    headers: jsonHeaders,
  });

  return parseCurrentPlan(response.data);
}

export async function getCurrentSubscription(): Promise<CurrentSubscription | null> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = subscriptionApiConfig[SubscriptionQueryKey.CurrentSubscription];

  try {
    const response = await axiosInst({
      method,
      url: getUrl(),
      headers: jsonHeaders,
    });

    return parseCurrentSubscription(response.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getTutorStorageUsage(): Promise<StorageUsage> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = subscriptionApiConfig[SubscriptionQueryKey.StorageUsage];

  const response = await axiosInst({
    method,
    url: getUrl(),
    headers: jsonHeaders,
  });

  return parseStorageUsage(response.data);
}

export async function createSubscriptionPayment(): Promise<CreateSubscriptionPaymentResponse> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = subscriptionApiConfig[SubscriptionQueryKey.CreatePayment];

  const response = await axiosInst({
    method,
    url: getUrl(),
    data: { period: 'monthly' },
    headers: jsonHeaders,
  });

  return parseCreateSubscriptionPaymentResponse(response.data);
}

export async function deleteCurrentAutoRenewal(): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = subscriptionApiConfig[SubscriptionQueryKey.DeleteAutoRenewal];

  try {
    await axiosInst({
      method,
      url: getUrl(),
      headers: jsonHeaders,
    });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return;
    }

    throw error;
  }
}
