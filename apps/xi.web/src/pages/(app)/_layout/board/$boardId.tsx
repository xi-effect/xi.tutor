/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

// Используем новую версию доски на базе Tldraw
const TldrawBoard = lazy(() =>
  import('modules.board').then((module) => ({ default: module.TldrawBoard })),
);

const paramsSchema = z.object({
  boardId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/board/$boardId')({
  component: BoardPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: ({ context, location }) => {
    console.log('TldrawBoard', context, location);
  },
});

function BoardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TldrawBoard />
    </Suspense>
  );
}
