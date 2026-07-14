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

const searchSchema = z.object({
  /** Deep link: id фигуры (или несколько через запятую) — фокус камеры и выделение. */
  shape: z.string().optional(),
  /** Deep link: id треда комментария — фокус камеры и открытие попапа. */
  comment: z.string().optional(),
  call: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/board/$boardId')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Доска',
      },
    ],
  }),
  component: BoardPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  beforeLoad: () => {
    // console.log('DrawBoard', context, location);
    // Предзагружаем модуль доски
    preloadBoard();
  },
});

function BoardPage() {
  return (
    <div
      className="min-h-0"
      style={{ height: 'calc(100dvh - var(--calls-layout-bottom-offset, 0px))' }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <DrawBoard />
      </Suspense>
    </div>
  );
}
