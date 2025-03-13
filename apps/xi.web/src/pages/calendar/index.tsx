/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/calendar/')({
  component: Calendar,
  beforeLoad: ({ context, location }) => {
    console.log('Calendar', context, location);
  },
});

function Calendar() {
  return <>1</>;
}
