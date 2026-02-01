/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense } from 'react';
import { z } from 'zod';
import { EmailPageConfirm } from 'pages.email-confirm';

const searchSchema = z.object({
  token: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(common)/_layout/confirm-email/')({
  component: ConfirmEmailPageWrapper,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
});

function ConfirmEmailPageWrapper() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EmailPageConfirm />
    </Suspense>
  );
}
