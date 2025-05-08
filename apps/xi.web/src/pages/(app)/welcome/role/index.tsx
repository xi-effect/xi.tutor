/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { WelcomeRolePage } from 'pages.welcome';

// @ts-ignore
export const Route = createFileRoute('/(app)/welcome/role/')({
  component: WelcomeRolePage,
  beforeLoad: ({ context }) => {
    console.log('Role', context, location);
  },
});

export const WelcomeRole = () => {
  return <WelcomeRolePage />;
};
