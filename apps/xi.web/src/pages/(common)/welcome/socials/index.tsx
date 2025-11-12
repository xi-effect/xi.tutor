import { createFileRoute } from '@tanstack/react-router';
import { WelcomeSocialsPage } from 'pages.welcome';

export const Socials = () => {
  return <WelcomeSocialsPage />;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/socials/')({
  component: Socials,
  // beforeLoad: ({ context }) => {
  //   console.log('Socials', context, location);
  // },
});
