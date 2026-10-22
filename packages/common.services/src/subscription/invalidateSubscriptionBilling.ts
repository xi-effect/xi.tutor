import type { QueryClient } from '@tanstack/react-query';
import { SubscriptionQueryKey } from 'common.api';

export const invalidateSubscriptionBilling = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.CurrentPlan] }),
    queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.CurrentSubscription] }),
    queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.StorageUsage] }),
  ]);
