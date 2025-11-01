import { createFileRoute } from '@tanstack/react-router';
import { SignUpPage } from 'pages.signup';
import { z } from 'zod';

const searchSchema = z.object({
  profile: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/(auth)/signup/')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Регистрация',
      },
    ],
  }),
  component: SignUp,
  validateSearch: (search) => searchSchema.parse(search),
});

function SignUp() {
  return <SignUpPage />;
}
