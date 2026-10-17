import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SubscriptionQueryKey } from 'common.api';
import { deleteCurrentAutoRenewal } from './subscriptionApi';

export const useDeleteAutoRenewal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCurrentAutoRenewal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SubscriptionQueryKey.CurrentSubscription],
      });
    },
  });
};
