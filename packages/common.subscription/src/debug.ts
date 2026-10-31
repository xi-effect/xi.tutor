import { SUBSCRIPTION_BILLING_ENABLED } from './config';

const devtoolsRequested = import.meta.env.VITE_MONETIZATION_DEVTOOLS === 'true';

export const isSubscriptionDebugEnabled = (): boolean =>
  SUBSCRIPTION_BILLING_ENABLED && devtoolsRequested;
