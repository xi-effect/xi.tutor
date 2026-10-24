import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionQueryKey, subscriptionQueryKeys, type CurrentSubscription } from 'common.api';
import { toSubscriptionBillingPeriod, trackSubscriptionAutoRenewDisabled } from 'common.utils';
import { useCurrentUser } from '../user';
import { deleteCurrentAutoRenewal } from './subscriptionApi';

export const useDeleteAutoRenewal = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  return useMutation({
    mutationFn: deleteCurrentAutoRenewal,
    onSuccess: async () => {
      if (typeof user?.id === 'number') {
        const subscription = queryClient.getQueryData<CurrentSubscription | null>(
          subscriptionQueryKeys.currentSubscription(user.id),
        );
        const billingPeriod = toSubscriptionBillingPeriod(
          subscription?.auto_renewal?.renewal_period,
        );
        if (billingPeriod) {
          trackSubscriptionAutoRenewDisabled({
            plan: subscription?.subscription.plan_kind ?? 'pro',
            billingPeriod,
          });
        }
      }

      await queryClient.invalidateQueries({
        queryKey: [SubscriptionQueryKey.CurrentSubscription],
      });
    },
  });
};
