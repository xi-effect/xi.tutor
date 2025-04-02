/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const About = () => {
  return <>About</>;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/welcome/about/')({
  component: About,
  beforeLoad: ({ context }) => {
    console.log('About', context, location);
  },
});
