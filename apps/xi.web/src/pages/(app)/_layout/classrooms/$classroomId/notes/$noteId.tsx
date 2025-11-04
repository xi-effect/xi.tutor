/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

// Используем новую версию доски на базе Tldraw с дополнительной оптимизацией
const Notes = lazy(() => import('pages.notes').then((module) => ({ default: module.Note })));

const paramsSchema = z.object({
  classroomId: z.string(),
  noteId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/classrooms/$classroomId/notes/$noteId')({
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
  component: ClassroomsNotesPage,
  // @ts-ignore
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  // beforeLoad: ({ context, location }) => {
  //   console.log('Editor', context, location);
  // },
});

function ClassroomsNotesPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Notes />
    </Suspense>
  );
}
