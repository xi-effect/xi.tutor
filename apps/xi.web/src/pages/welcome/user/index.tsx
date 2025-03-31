/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const User = () => {
  return <>User</>;
};

// @ts-ignore
export const Route = createFileRoute('/welcome/user/')({
  component: User,
  beforeLoad: ({ context }) => {
    console.log('User', context, location);
  },
});
