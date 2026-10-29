import type { QueryClient } from '@tanstack/react-query';
import { ClassroomsQueryKey, SubscriptionQueryKey } from 'common.api';

export const invalidateSubscriptionBilling = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.CurrentPlan] }),
    queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.CurrentSubscription] }),
    queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.StorageUsage] }),
    queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.ClassroomCounts] }),
    queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassrooms] }),
    queryClient.invalidateQueries({ queryKey: [ClassroomsQueryKey.GetClassroom] }),
  ]);
