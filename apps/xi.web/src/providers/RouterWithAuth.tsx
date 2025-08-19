import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from 'common.auth';
import { ThemeProvider } from 'common.theme';
import { NotificationsProvider, NetworkProvider } from 'common.services';
import { router } from '../router';
import { AuthSocketBridge } from './AuthSocketBridge';
import { Toaster } from 'sonner';

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
              <Toaster visibleToasts={3} expand />
            </NotificationsProvider>
          </NetworkProvider>
        </ThemeProvider>
      </AuthSocketBridge>
    </AuthProvider>
  );
};
