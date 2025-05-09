/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';

const Board = lazy(() => import('modules.board').then((module) => ({ default: module.Board })));

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/board/')({
  component: BoardPage,
  beforeLoad: ({ context, location }) => {
    console.log('Board', context, location);
  },
});

function BoardPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Board />
    </Suspense>
  );
}
