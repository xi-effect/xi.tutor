/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

const DrawBoard = lazy(() =>
  import('modules.board').then((module) => ({ default: module.DrawBoard })),
);

// Предзагружаем модуль доски при создании роута
const preloadBoard = () => {
  import('modules.board');
};

const paramsSchema = z.object({
  boardId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/board/$boardId')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Доска',
      },
    ],
    links: [
      {
        rel: 'modulepreload',
        href: '/src/modules/board/index.tsx',
      },
    ],
  }),
  component: BoardPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: () => {
    // console.log('DrawBoard', context, location);
    // Предзагружаем модуль доски
    preloadBoard();
  },
});

function BoardPage() {
  return (
    <div className="h-full min-h-0">
      <Suspense fallback={<LoadingScreen />}>
        <DrawBoard />
      </Suspense>
    </div>
  );
}
