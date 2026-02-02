/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { NewPasswordPage, ResetPasswordPage } from 'pages.reset-password';
import { z } from 'zod';

const searchSchema = z.object({
  token: z.string().optional(),
});

// @ts-ignore
export const Route = createFileRoute('/(auth)/reset-password/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Сброс пароля',
      },
    ],
  }),
  component: ResetPasswordWrapper,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
});

function ResetPasswordWrapper() {
  const search = useSearch({ strict: false }) as { token?: string };
  const hasToken = !!search?.token;

  if (hasToken) {
    return <NewPasswordPage />;
  }
  return <ResetPasswordPage />;
}
