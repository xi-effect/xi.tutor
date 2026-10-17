/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionPaymentResult } from 'features.subscription/payment-result';

const PaymentResultPage = () => {
  return <SubscriptionPaymentResult />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/settings/subscription/payment-result')({
  validateSearch: (search: Record<string, unknown>) => ({
    payment_id:
      typeof search.payment_id === 'string' && search.payment_id.trim().length > 0
        ? search.payment_id
        : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: 'sovlium | Оплата',
      },
    ],
  }),
  component: PaymentResultPage,
});
