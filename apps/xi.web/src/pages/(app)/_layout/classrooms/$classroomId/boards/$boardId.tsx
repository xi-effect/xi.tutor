/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

const DrawBoard = lazy(() =>
  import('modules.board').then((module) => ({ default: module.DrawBoard })),
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
    <div className="h-full min-h-0">
      <Suspense fallback={<LoadingScreen />}>
        <DrawBoard />
      </Suspense>
    </div>
  );
}
