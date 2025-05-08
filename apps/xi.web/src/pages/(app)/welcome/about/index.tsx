/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { WelcomeAboutPage } from 'pages.welcome';

// @ts-ignore
export const Route = createFileRoute('/(app)/welcome/about/')({
  component: WelcomeAboutPage,
  beforeLoad: ({ context }) => {
    console.log('About', context, location);
  },
});

export const WelcomeAbout = () => {
  return <WelcomeAboutPage />;
};
