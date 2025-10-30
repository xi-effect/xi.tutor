/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy } from 'react';
import { z } from 'zod';

const Notes = lazy(() => import('pages.notes').then((m) => ({ default: m.Note })));

const paramsSchema = z.object({
  editorId: z.string(),
});

export const Route = createFileRoute('/(app)/_layout/note/$editorId')({
  head: () => ({
    meta: [{ title: 'sovlium | Редактор' }],
  }),
  component: EditorPage,
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  beforeLoad: ({ context, location }) => {
    console.log('Editor', context, location);
  },
});

function EditorPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Notes />
    </Suspense>
  );
}
