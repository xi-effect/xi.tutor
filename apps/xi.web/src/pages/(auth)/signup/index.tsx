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
  return (
    <div className="xs:h-screen dark:bg-gray-0 flex h-[100dvh] w-screen flex-col flex-wrap content-center justify-center p-1">
      <div className="xs:border xs:border-gray-10 dark:bg-gray-5 xs:rounded-2xl flex h-[600px] w-full max-w-[420px] p-8">
        <SignUpPage />
      </div>
    </div>
  );
}
