/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

// Используем новую версию доски на базе Tldraw с дополнительной оптимизацией
const TldrawBoard = lazy(() =>
  import('modules.board').then((module) => ({ default: module.TldrawBoard })),
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
    // console.log('TldrawBoard', context, location);
    // Предзагружаем модуль доски
    preloadBoard();
  },
});

function BoardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TldrawBoard />
    </Suspense>
  );
}
