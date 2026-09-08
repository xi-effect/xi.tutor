import { SUBSCRIPTION_BILLING_ENABLED } from './config';

export const isSubscriptionDebugEnabled = (): boolean =>
  SUBSCRIPTION_BILLING_ENABLED && import.meta.env.DEV;
