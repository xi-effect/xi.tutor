
import { createFileRoute } from '@tanstack/react-router';
import { SignUpPage } from 'pages.signup';
import { z } from 'zod';

const searchSchema = z.object({
  iid: z.string().optional(),
  community: z.string().optional(),
});


export const Route = createFileRoute('/(auth)/signup/')({
  component: SignUp,
  validateSearch: (search) => searchSchema.parse(search),
});

function SignUp() {
  return (
    <SignUpPage />
  );
}
