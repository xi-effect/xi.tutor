import { Outlet, createFileRoute, useRouter } from '@tanstack/react-router';
import { Navigation } from 'modules.navigation';
import {
  CompactView,
  LiveKitProvider,
  useLivekitToken,
  RoomProvider,
  useCallStore,
  ModeSyncProvider,
} from 'modules.calls';
import { useEffect } from 'react';

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
  const { token = null } = useLivekitToken('1', '2');

  useEffect(() => {
    const pathname = router.state.location.pathname;
    if (pathname.includes('/call')) {
      updateStore('mode', 'full');
    }
  }, [router.state.location.pathname, updateStore]);

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <Navigation>
        <RoomProvider>
          <LiveKitProvider token={token || ''}>
            <ModeSyncProvider>
              <CompactView firstId="1" secondId="2">
                <Outlet />
              </CompactView>
            </ModeSyncProvider>
          </LiveKitProvider>
        </RoomProvider>
      </Navigation>
    </div>
  );
}
