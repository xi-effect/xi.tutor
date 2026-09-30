import { useMutation } from '@tanstack/react-query';
import { createSubscriptionPayment } from './subscriptionApi';

export const useCreateSubscriptionPayment = () =>
  useMutation({
    mutationFn: createSubscriptionPayment,
  });
