/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense } from 'react';
import { z } from 'zod';
import { EmailPage, isEmailWaitingScreen } from 'pages.email';
import { WelcomeStageGuard } from 'pages.welcome';

const searchSchema = z.object({
  token: z.string().optional(),
  redirect: z.string().optional(),
  invite: z.string().optional(),
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
  const { token } = Route.useSearch();
  const page = (
    <Suspense fallback={<LoadingScreen />}>
      <EmailPage />
    </Suspense>
  );

  // Ссылка из письма (?token=) остаётся на экране результата.
  // Экран ожидания смотрит на /home: если почта уже подтверждена, стадия ушла
  // дальше email-confirmation, и гард уводит на следующий шаг или на главную.
  if (!isEmailWaitingScreen(token)) {
    return page;
  }

  return <WelcomeStageGuard>{page}</WelcomeStageGuard>;
}
