import { useQuery } from '@tanstack/react-query';
import { subscriptionQueryKeys } from 'common.api';
import { getTutorStorageUsage } from './subscriptionApi';
import { useTutorBillingScope } from './useTutorBillingScope';

export const useStorageUsage = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);

  return useQuery({
    queryKey:
      userId === null
        ? (['storageUsage', 'anonymous'] as const)
        : subscriptionQueryKeys.storageUsage(userId),
    queryFn: getTutorStorageUsage,
    enabled,
  });
};
