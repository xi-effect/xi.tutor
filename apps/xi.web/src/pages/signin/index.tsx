/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from 'pages.signin';

export const Route = createFileRoute('/signin/')({
  component: SignIn,
  beforeLoad: ({ context }) => {
    console.log('SignInRoute', context, location);
  },
});

function SignIn() {
  return (
    <>
      <SignInPage />
    </>
  );
}
