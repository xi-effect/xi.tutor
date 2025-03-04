/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute, redirect } from '@tanstack/react-router';

import { SignInPage } from 'pages.signin';

export const Route = createFileRoute('/signin/')({
  component: SignIn,
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      // @ts-ignore
      throw redirect({ to: search.redirect });
    }
  },
});

function SignIn() {
  return (
    <>
      <SignInPage />
    </>
  );
}
