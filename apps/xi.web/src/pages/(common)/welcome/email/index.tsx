/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense } from 'react';
import { z } from 'zod';
import { EmailPage } from 'pages.email';

const searchSchema = z.object({
  token: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/email/')({
  head: () => ({
    meta: [{ title: 'sovlium | Подтвердите почту' }],
  }),
  component: EmailPageWrapper,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
});

function EmailPageWrapper() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <EmailPage />
    </Suspense>
  );
}
