import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { AuthContextT } from 'common.auth';

interface MyRouterContext {
  auth: AuthContextT;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
  beforeLoad: ({ context, location }) => {
    console.log('Route', context, location);

    if (!context.auth.isAuthenticated && !['/signin', '/signup'].includes(location.pathname)) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => (
    <>
      {/* <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        <Link to="/signin" className="[&.active]:font-bold">
          About
        </Link>
        <h1 className="text-3xl font-bold underline">
          Hello world!
        </h1>
      </div>
      <hr /> */}

      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
