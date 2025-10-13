import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy, useEffect } from 'react';

// Динамические импорты для крупных модулей
const Navigation = lazy(() =>
  import('modules.navigation').then((module) => ({ default: module.Navigation })),
);
const CallComponents = lazy(() =>
  import('modules.calls').then((module) => ({
    default: () => (
      <module.LiveKitProvider>
        <module.RoomProvider>
          <module.ModeSyncProvider>
            <module.CompactView firstId="1" secondId="2">
              <Outlet />
            </module.CompactView>
          </module.ModeSyncProvider>
        </module.RoomProvider>
      </module.LiveKitProvider>
    ),
  })),
);

export const Route = createFileRoute('/(app)/_layout')({
  head: () => ({
    meta: [
      {
        // title: 'sovlium',
      },
      // {
      //   name: 'description',
      //   content: 'My App is a web application',
      // },
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
  const router = useRouter();

  useEffect(() => {
    const pathname = router.state.location.pathname;
    if (pathname.includes('/call')) {
      // Обновляем store через динамический импорт
      import('modules.calls').then((module) => {
        module.useCallStore.getState().updateStore('mode', 'full');
      });
    }
  }, [router.state.location.pathname]);

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Navigation>
          <Suspense fallback={<LoadingScreen />}>
            <CallComponents />
          </Suspense>
        </Navigation>
      </Suspense>
    </div>
  );
}
