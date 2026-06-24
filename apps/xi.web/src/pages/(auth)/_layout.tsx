import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SupportFooter } from 'modules.navigation';

function AuthLayout() {
  return (
    <>
      <Outlet />
      <SupportFooter />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(auth)/_layout')({
  component: AuthLayout,
});
