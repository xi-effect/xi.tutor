/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { PaymentsPage } from 'pages.payments';

const Payments = () => {
  return <PaymentsPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/payments/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Контроль оплат',
      },
    ],
  }),
  component: Payments,
  // beforeLoad: ({ context, location }) => {
  //   console.log('Payments', context, location);
  // },
});
