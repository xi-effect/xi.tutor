/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const Content = () => {
  return <>Content</>;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/content/')({
  component: Content,
  beforeLoad: ({ context, location }) => {
    console.log('Content', context, location);
  },
});
