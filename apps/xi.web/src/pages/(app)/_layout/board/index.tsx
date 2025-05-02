/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { Board } from 'modules.board';

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/board/')({
  component: BoardPage,
  beforeLoad: ({ context, location }) => {
    console.log('Board', context, location);
  },
});

function BoardPage() {
  return <Board />;
}
