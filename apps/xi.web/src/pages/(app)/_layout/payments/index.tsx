/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { PaymentControl as Payments } from 'features.charts';

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/payments/')({
  component: PaymentsPage,
  beforeLoad: ({ context, location }) => {
    console.log('Payments', context, location);
  },
});

function PaymentsPage() {
  return <Payments />;
}
