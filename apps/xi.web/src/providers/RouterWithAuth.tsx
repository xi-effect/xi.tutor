import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from 'common.auth';
import { ThemeProvider } from 'common.theme';
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
          <RouterWithAuthContext />
          <Toaster visibleToasts={3} expand />
        </ThemeProvider>
      </AuthSocketBridge>
    </AuthProvider>
  );
};
