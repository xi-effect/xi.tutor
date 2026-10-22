import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateSubscriptionBilling } from './invalidateSubscriptionBilling';
import { redeemPromocode } from './subscriptionApi';

export const useRedeemPromocode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: redeemPromocode,
    onSuccess: () => invalidateSubscriptionBilling(queryClient),
  });
};
