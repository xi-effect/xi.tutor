import { useQuery } from '@tanstack/react-query';
import { subscriptionQueryKeys } from 'common.api';
import {
  overlayMonetizationQuery,
  resolveMonetizationStorage,
  useMonetizationDevStore,
} from './monetizationDevtools';
import { getTutorStorageUsage } from './subscriptionApi';
import { BILLING_QUERY_FRESHNESS, useTutorBillingScope } from './useTutorBillingScope';

export const useStorageUsage = (options?: { enabled?: boolean }) => {
  const { userId, enabled } = useTutorBillingScope(options?.enabled ?? true);
  const override = useMonetizationDevStore((state) => state.override);
  const query = useQuery({
    queryKey:
      userId === null
        ? (['storageUsage', 'anonymous'] as const)
        : subscriptionQueryKeys.storageUsage(userId),
    queryFn: getTutorStorageUsage,
    enabled,
    ...BILLING_QUERY_FRESHNESS,
  });
  const usage = resolveMonetizationStorage(query.data, override);
  if (!usage || usage === query.data) return query;

  return overlayMonetizationQuery(query, usage, true);
};
