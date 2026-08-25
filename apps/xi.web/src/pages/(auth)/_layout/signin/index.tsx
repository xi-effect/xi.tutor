/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute, redirect } from '@tanstack/react-router';

import { resolveSigninRedirect, SignInPage } from 'pages.signin';

// @ts-ignore
export const Route = createFileRoute('/(auth)/_layout/signin/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Вход',
      },
    ],
  }),
  beforeLoad: ({ context, search }) => {
    if (!context.auth.isAuthenticated) return;

    throw redirect({
      replace: true,
      to: resolveSigninRedirect(
        typeof search === 'object' && search && 'redirect' in search
          ? String((search as { redirect?: string }).redirect ?? '')
          : undefined,
      ),
    });
  },
  component: SignIn,
});

function SignIn() {
  return (
    <>
      <SignInPage />
    </>
  );
}
