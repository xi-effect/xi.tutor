import { createFileRoute } from '@tanstack/react-router';
import { WelcomeUserPage } from 'pages.welcome';
import { z } from 'zod';

const searchSchema = z.object({
  redirect: z.string().optional(),
  invite: z.string().optional(),
});

const User = () => {
  return <WelcomeUserPage />;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/user/')({
  head: () => ({
    meta: [{ title: 'sovlium | Профиль' }],
  }),
  component: User,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
});
