/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/calendar/')({
  component: Calendar,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

function Calendar() {
  return <>1</>;
}
