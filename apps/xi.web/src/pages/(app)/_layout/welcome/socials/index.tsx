/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const Socials = () => {
  return <>Socials</>;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/welcome/socials/')({
  component: Socials,
  beforeLoad: ({ context }) => {
    console.log('Socials', context, location);
  },
});
