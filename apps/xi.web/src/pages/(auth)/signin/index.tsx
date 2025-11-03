/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from 'pages.signin';

// @ts-ignore
export const Route = createFileRoute('/(auth)/signin/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Вход',
      },
    ],
  }),
  component: SignIn,
  // beforeLoad: ({ context }) => {
  //   console.log('SignInRoute', context, location);
  // },
});

function SignIn() {
  return (
    <>
      <SignInPage />
    </>
  );
}
