/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { MathBankPage } from 'pages.bank';

const Bank = () => {
  return <MathBankPage />;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/bank/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Банк заданий',
      },
    ],
  }),
  component: Bank,
});
