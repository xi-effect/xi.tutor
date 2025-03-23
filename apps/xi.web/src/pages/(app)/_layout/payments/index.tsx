/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const Payments = () => {
  return <>Payments</>;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/payments/')({
  component: Payments,
  beforeLoad: ({ context, location }) => {
    console.log('Payments', context, location);
  },
});
