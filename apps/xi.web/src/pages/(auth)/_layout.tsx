import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SupportPageShell } from 'modules.navigation';

function AuthLayout() {
  return (
    <SupportPageShell>
      <Outlet />
    </SupportPageShell>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(auth)/_layout')({
  component: AuthLayout,
});
