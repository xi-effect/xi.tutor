import { useQuery } from '@tanstack/react-query';
import { subscriptionQueryKeys } from 'common.api';
import { getCurrentSubscription } from './subscriptionApi';
import { useTutorBillingScope } from './useTutorBillingScope';

export const useCurrentSubscription = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);

  return useQuery({
    queryKey:
      userId === null
        ? (['currentSubscription', 'anonymous'] as const)
        : subscriptionQueryKeys.currentSubscription(userId),
    queryFn: getCurrentSubscription,
    enabled,
  });
};
