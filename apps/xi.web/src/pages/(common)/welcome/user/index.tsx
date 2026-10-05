import { createFileRoute } from '@tanstack/react-router';
import { WelcomeUserPage } from 'pages.welcome';

const User = () => {
  return <WelcomeUserPage />;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/user/')({
  head: () => ({
    meta: [{ title: 'sovlium | Профиль' }],
  }),
  component: User,
  // beforeLoad: ({ context }) => {
  //   console.log('User', context, location);
  // },
});
