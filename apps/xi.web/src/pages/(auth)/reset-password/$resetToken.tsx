/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { NewPasswordPage } from 'pages.reset-password';

// @ts-ignore
export const Route = createFileRoute('/(auth)/reset-password/$resetToken')({
  component: NewPassword,

  beforeLoad: ({ context, location }) => {
    console.log('NewPasswordRoute', context, location);
  },
});

export function NewPassword() {
  return <NewPasswordPage />;
}
