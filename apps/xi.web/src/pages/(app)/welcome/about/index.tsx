import { createFileRoute } from '@tanstack/react-router';
import { WelcomeAboutPage } from 'pages.welcome';

export const About = () => {
  return <WelcomeAboutPage />;
};

export const Route = createFileRoute('/(app)/welcome/about/')({
  component: About,
  beforeLoad: ({ context }) => {
    console.log('About', context, location);
  },
});
