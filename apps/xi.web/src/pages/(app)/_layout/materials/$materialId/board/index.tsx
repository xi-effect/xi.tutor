/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

const DrawBoard = lazy(() =>
  import('modules.board').then((module) => ({ default: module.DrawBoard })),
);

const paramsSchema = z.object({
  materialId: z.string(),
});

const searchSchema = z.object({
  shape: z.string().optional(),
  comment: z.string().optional(),
  call: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/materials/$materialId/board/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Доска',
      },
    ],
  }),
  component: MaterialsBoardPage,
  // @ts-ignore
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  // beforeLoad: ({ context, location }) => {
  //   console.log('Board', context, location);
  // },
});
function MaterialsBoardPage() {
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
