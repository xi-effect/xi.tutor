import { Outlet, createFileRoute } from '@tanstack/react-router';
import { Navigation } from 'modules.navigation';

export const Route = createFileRoute('/(app)/_layout')({
  head: () => ({
    meta: [
      // {
      //   name: 'description',
      //   content: 'My App is a web application',
      // },
      {
        title: 'xi.effect',
      },
    ],
    // links: [
    //   {
    //     rel: 'icon',
    //     href: '/favicon.ico',
    //   },
    // ],
    // scripts: [
    //   {
    //     src: 'https://www.google-analytics.com/analytics.js',
    //   },
    // ],
  }),
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Navigation>
        <Outlet />
      </Navigation>
    </div>
  );
}
