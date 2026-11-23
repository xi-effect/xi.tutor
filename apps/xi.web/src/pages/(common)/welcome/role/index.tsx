import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { WelcomeRolePage } from 'pages.welcome';

const searchSchema = z.object({
  redirect: z.string().optional(),
  invite: z.string().optional(),
});

const Role = () => {
  return <WelcomeRolePage />;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/welcome/role/')({
  head: () => ({
    meta: [{ title: 'sovlium | Роль' }],
  }),
  component: Role,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
});
