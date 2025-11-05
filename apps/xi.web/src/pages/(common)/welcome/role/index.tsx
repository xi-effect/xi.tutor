import { createFileRoute } from '@tanstack/react-router';
import { WelcomeRolePage } from 'pages.welcome';

export const Role = () => {
  return <WelcomeRolePage />;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/role/')({
  component: Role,
  // beforeLoad: ({ context }) => {
  //   console.log('Role', context, location);
  // },
});
