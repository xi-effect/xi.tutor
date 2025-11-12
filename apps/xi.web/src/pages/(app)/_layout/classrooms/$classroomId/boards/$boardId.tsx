/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

// Используем новую версию доски на базе Tldraw с дополнительной оптимизацией
const TldrawBoard = lazy(() =>
  import('modules.board').then((module) => ({ default: module.TldrawBoard })),
);

const paramsSchema = z.object({
  classroomId: z.string(),
  boardId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/$classroomId/boards/$boardId')({
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
  component: ClassroomsBoardPage,
  // @ts-ignore
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  // beforeLoad: ({ context, location }) => {
  //   console.log('Board', context, location);
  // },
});

function ClassroomsBoardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TldrawBoard />
    </Suspense>
  );
}
