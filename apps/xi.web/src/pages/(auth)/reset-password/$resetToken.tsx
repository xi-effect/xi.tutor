/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/(auth)/reset-password/$resetToken')({
  component: NewPassword,
  beforeLoad: ({ context }) => {
    console.log('NewPasswordRoute', context, location);
  },
});

function NewPassword() {
  return <>1</>;
}
