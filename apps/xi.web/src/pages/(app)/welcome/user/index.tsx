/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { WelcomeUserPage } from 'pages.welcome';

// @ts-ignore
export const Route = createFileRoute('/(app)/welcome/user/')({
  component: WelcomeUserPage,
  beforeLoad: ({ context }) => {
    console.log('User', context, location);
  },
});

export const WelcomeUser = () => {
  return <WelcomeUserPage />;
};
