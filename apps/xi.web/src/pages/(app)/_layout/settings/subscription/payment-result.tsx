/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionPaymentResult } from 'features.subscription/payment-result';

const PaymentResultPage = () => {
  return <SubscriptionPaymentResult />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/settings/subscription/payment-result')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Оплата',
      },
    ],
  }),
  component: PaymentResultPage,
});
