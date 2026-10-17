import { useQuery } from '@tanstack/react-query';
import { subscriptionQueryKeys } from 'common.api';
import { getCurrentPlan } from './subscriptionApi';
import { useTutorBillingScope } from './useTutorBillingScope';

export const useCurrentPlan = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);

  return useQuery({
    queryKey:
      userId === null
        ? (['currentPlan', 'anonymous'] as const)
        : subscriptionQueryKeys.currentPlan(userId),
    queryFn: getCurrentPlan,
    enabled,
  });
};
