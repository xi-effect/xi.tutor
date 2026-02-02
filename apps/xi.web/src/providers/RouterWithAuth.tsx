import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from 'common.auth';
import { NetworkProvider, NotificationsProvider } from 'common.services';
import { ThemeProvider } from 'common.theme';
import { Toaster } from 'sonner';
import { router } from '../router';
import { AuthSocketBridge } from './AuthSocketBridge';

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
              <Toaster visibleToasts={3} expand closeButton />
            </NotificationsProvider>
          </NetworkProvider>
        </ThemeProvider>
      </AuthSocketBridge>
    </AuthProvider>
  );
};
