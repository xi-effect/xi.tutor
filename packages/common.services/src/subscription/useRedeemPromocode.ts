import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  mapSubscriptionPromoFailure,
  markSubscriptionPeriodExtendedLocally,
  trackSubscriptionPromoCodeApplied,
  trackSubscriptionPromoCodeFailed,
  trackSubscriptionPromoCodeSubmitted,
} from 'common.utils';
import { invalidateSubscriptionBilling } from './invalidateSubscriptionBilling';
import { redeemPromocode } from './subscriptionApi';

export const useRedeemPromocode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemPromocode,
    onMutate: () => {
      trackSubscriptionPromoCodeSubmitted();
    },
    onSuccess: () => {
      markSubscriptionPeriodExtendedLocally();
      trackSubscriptionPromoCodeApplied();
      return invalidateSubscriptionBilling(queryClient);
    },
    onError: (error) => {
      trackSubscriptionPromoCodeFailed(mapSubscriptionPromoFailure(error));
    },
  });
};
