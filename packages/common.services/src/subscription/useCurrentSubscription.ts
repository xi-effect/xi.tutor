import { useQuery } from '@tanstack/react-query';
import { subscriptionQueryKeys } from 'common.api';
import {
  overlayMonetizationQuery,
  resolveMonetizationSubscription,
  useMonetizationDevStore,
} from './monetizationDevtools';
import { getCurrentSubscription } from './subscriptionApi';
import { useTutorBillingScope } from './useTutorBillingScope';

export const useCurrentSubscription = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);
  const override = useMonetizationDevStore((state) => state.override);
  const query = useQuery({
    queryKey:
      userId === null
        ? (['currentSubscription', 'anonymous'] as const)
        : subscriptionQueryKeys.currentSubscription(userId),
    queryFn: getCurrentSubscription,
    enabled,
  });
  const subscription = resolveMonetizationSubscription(query.data, override);
  if (subscription === query.data || subscription === undefined) return query;

  return overlayMonetizationQuery(query, subscription, true);
};
