import { createFileRoute } from '@tanstack/react-router';
import { WelcomeSocialsPage } from 'pages.welcome';

export const Socials = () => {
  return <WelcomeSocialsPage />;
};

export const Route = createFileRoute('/(app)/welcome/socials/')({
  component: Socials,
  beforeLoad: ({ context }) => {
    console.log('Socials', context, location);
  },
});
