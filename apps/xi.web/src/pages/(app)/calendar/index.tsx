/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/(app)/calendar/')({
  component: Calendar,
  beforeLoad: ({ context, location }) => {
    console.log('Calendar', context, location);
  },
});

function Calendar() {
  return <>1</>;
}
