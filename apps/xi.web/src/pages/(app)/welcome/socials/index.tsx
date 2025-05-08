import { createFileRoute } from '@tanstack/react-router';
import { WelcomeSocialsPage } from 'pages.welcome';

export const Route = createFileRoute('/(app)/welcome/socials/')({
  component: WelcomeSocialsPage,
  beforeLoad: ({ context }) => {
    console.log('Socials', context, location);
  },
});

export const WelcomeSocials = () => {
  return <WelcomeSocialsPage />;
};
