import { createFileRoute } from '@tanstack/react-router';

import { SignInPage } from 'pages.signin';

export const Route = createFileRoute('/signin/')({
  component: SignIn,
});

function SignIn() {
  return (
    <>
      <SignInPage />
    </>
  );
}
