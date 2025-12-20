/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense } from 'react';
import { z } from 'zod';
import { EmailPageConfirm } from 'pages.email-confirm';

const paramsSchema = z.object({
  emailId: z.string(),
});

// @ts-ignore
export const Route = createFileRoute('/(common)/_layout/confirm-email/$emailId')({
  component: ConfirmEmailPage,
  // @ts-ignore
  parseParams: (params: Record<string, string>) => paramsSchema.parse(params),
  // beforeLoad: ({ context, location }) => {
  //   console.log('Invites', context, location);
  // },
});

function ConfirmEmailPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EmailPageConfirm />;
    </Suspense>
  );
}
