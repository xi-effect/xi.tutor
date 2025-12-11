/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense } from 'react';
import { z } from 'zod';
import { EmailPage } from 'pages.email';

const paramsSchema = z.object({
  emailId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/email/$emailId')({
  head: () => ({
    meta: [{ title: 'sovlium | Подтвердите почту' }],
  }),
  component: EditorPage,

  // @ts-ignore
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  // beforeLoad: ({ context, location }) => {
  //   console.log('Email', context, location);
  // },
});

function EditorPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EmailPage />
    </Suspense>
  );
}
