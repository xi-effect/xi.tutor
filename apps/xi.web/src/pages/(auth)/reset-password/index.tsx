/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { ResetPasswordPage } from 'pages.reset-password';

// @ts-ignore
export const Route = createFileRoute('/(auth)/reset-password/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Сброс пароля',
      },
    ],
  }),
  component: ResetPassword,
  beforeLoad: ({ context }) => {
    console.log('ResetPasswordRoute', context, location);
  },
});

function ResetPassword() {
  return <ResetPasswordPage />;
}
