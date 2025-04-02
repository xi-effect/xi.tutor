/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

const Role = () => {
  return <>Role</>;
};

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/welcome/role/')({
  component: Role,
  beforeLoad: ({ context }) => {
    console.log('Role', context, location);
  },
});
