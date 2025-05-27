import { Outlet, createFileRoute, useParams } from '@tanstack/react-router';
import { Navigation } from 'modules.navigation';
import { CompactView } from 'modules.calls';
import { Room } from 'livekit-client';
import { RoomProvider } from 'modules.calls';

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
  const { callId } = useParams({ from: '/(app)/_layout/call/$callId' });
  const room = new Room();

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <Navigation>
        <RoomProvider room={room}>
          <CompactView firstId={callId} secondId="2">
            <Outlet />
          </CompactView>
        </RoomProvider>
      </Navigation>
    </div>
  );
}
