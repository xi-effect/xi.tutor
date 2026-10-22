import { useQuery } from '@tanstack/react-query';
import { subscriptionQueryKeys } from 'common.api';
import {
  overlayMonetizationQuery,
  resolveMonetizationPlan,
  useMonetizationDevStore,
} from './monetizationDevtools';
import { getCurrentPlan } from './subscriptionApi';
import { useTutorBillingScope } from './useTutorBillingScope';

export const useCurrentPlan = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);
  const override = useMonetizationDevStore((state) => state.override);
  const query = useQuery({
    queryKey:
      userId === null
        ? (['currentPlan', 'anonymous'] as const)
        : subscriptionQueryKeys.currentPlan(userId),
    queryFn: getCurrentPlan,
    enabled,
  });
  const plan = resolveMonetizationPlan(query.data, override);
  if (!plan || plan === query.data) return query;

  return overlayMonetizationQuery(query, plan, true);
};
