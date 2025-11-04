import { createFileRoute } from '@tanstack/react-router';
import { WelcomeRolePage } from 'pages.welcome';

export const Role = () => {
  return <WelcomeRolePage />;
};

export const Route = createFileRoute('/(app)/welcome/role/')({
  component: Role,
  // beforeLoad: ({ context }) => {
  //   console.log('Role', context, location);
  // },
});
