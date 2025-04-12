/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/board/')({
  component: Board,
  beforeLoad: ({ context, location }) => {
    console.log('Calendar', context, location);
  },
});

function Board() {
  return <>1</>;
}
