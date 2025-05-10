import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/welcome/_layout')({
  head: () => ({
    meta: [
      {
        title: 'xi.effect',
      },
    ],
  }),
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Outlet />
    </div>
  );
}
