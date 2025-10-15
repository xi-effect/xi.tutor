import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { Suspense, lazy, useEffect } from 'react';

// Импортируем провайдеры синхронно, так как они нужны везде
import {
  CompactView,
  LiveKitProvider,
  RoomProvider,
  useCallStore,
  ModeSyncProvider,
} from 'modules.calls';

// Динамические импорты для крупных модулей
const Navigation = lazy(() =>
  import('modules.navigation').then((module) => ({ default: module.Navigation })),
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
  const updateStore = useCallStore((state) => state.updateStore);

  useEffect(() => {
    const pathname = router.state.location.pathname;
    const search = router.state.location.search;

    if (pathname.includes('/call')) {
      updateStore('mode', 'full');
    } else if (pathname.includes('/classrooms') && search.call) {
      // Если мы на странице classroom и есть параметр call, переключаемся в compact режим
      updateStore('mode', 'compact');
    }
  }, [router.state.location.pathname, router.state.location.search, updateStore]);

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Navigation>
          <RoomProvider>
            <LiveKitProvider>
              <ModeSyncProvider>
                <CompactView firstId="1" secondId="2">
                  <Outlet />
                </CompactView>
              </ModeSyncProvider>
            </LiveKitProvider>
          </RoomProvider>
        </Navigation>
      </Suspense>
    </div>
  );
}
