/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/(auth)/reset-password/')({
  component: ResetPassword,
  beforeLoad: ({ context }) => {
    console.log('ResetPasswordRoute', context, location);
  },
});

function ResetPassword() {
  return <>1</>;
}
