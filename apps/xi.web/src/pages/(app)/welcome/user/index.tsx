import { createFileRoute } from '@tanstack/react-router';
import { WelcomeUserPage } from 'pages.welcome';

export const User = () => {
  return <WelcomeUserPage />;
};

export const Route = createFileRoute('/(app)/welcome/user/')({
  component: User,
  // beforeLoad: ({ context }) => {
  //   console.log('User', context, location);
  // },
});
