/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Outlet, createFileRoute } from '@tanstack/react-router';

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout')({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div>
      <h1>Layout</h1>
      <Outlet />
    </div>
  );
}
