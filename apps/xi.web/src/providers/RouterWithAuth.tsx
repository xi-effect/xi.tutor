import { useSyncExternalStore } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from 'common.auth';
import { NetworkProvider, NotificationsProvider } from 'common.services';
import { ThemeProvider } from 'common.theme';
import { Toaster } from 'sonner';
import { router } from '../router';
import { AuthSocketBridge } from './AuthSocketBridge';

/** Маршруты с доской — тосты не должны перекрывать DrawZoomPanel (right/bottom). */
const isBoardRoute = (pathname: string) =>
  pathname.includes('/board') || pathname.includes('/boards/');

/** Чуть выше зума, ближе к правому краю (зум: right-4 / bottom-4). */
const BOARD_TOAST_OFFSET = { bottom: 64, right: 16 } as const;
const BOARD_TOAST_MOBILE_OFFSET = { bottom: 112, right: 16 } as const;

const useRouterPathname = () =>
  useSyncExternalStore(
    (onChange) => router.subscribe('onResolved', onChange),
    () => router.state.location.pathname,
    () => router.state.location.pathname,
  );

const AppToaster = () => {
  const pathname = useRouterPathname();
  const onBoard = isBoardRoute(pathname);

  return (
    <Toaster
      visibleToasts={3}
      expand
      closeButton
      offset={onBoard ? BOARD_TOAST_OFFSET : undefined}
      mobileOffset={onBoard ? BOARD_TOAST_MOBILE_OFFSET : undefined}
    />
  );
};

const RouterWithAuthContext = () => {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
};

export const RouterWithAuth = () => {
  return (
    <AuthProvider>
      <AuthSocketBridge>
        <ThemeProvider>
          <NetworkProvider>
            <NotificationsProvider>
              <RouterWithAuthContext />
              <AppToaster />
            </NotificationsProvider>
          </NetworkProvider>
        </ThemeProvider>
      </AuthSocketBridge>
    </AuthProvider>
  );
};
