/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { NewPasswordPage } from 'pages.reset-password';

// @ts-ignore
export const Route = createFileRoute('/(auth)/reset-password/$resetToken')({
  component: function NewPasswordRouteComponent() {
    const { resetToken } = Route.useParams();
    return <NewPasswordPage resetToken={resetToken} />;
  },

  beforeLoad: ({ context }) => {
    console.log('NewPasswordRoute', context, location);
  },
});
