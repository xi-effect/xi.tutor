import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, useAuth } from 'common.auth';
import { ThemeProvider } from 'common.theme';
import { NotificationsProvider, NetworkProvider } from 'common.services';
import { router } from '../router';
import { AuthSocketBridge } from './AuthSocketBridge';
import { Toaster } from 'sonner';

const RouterWithAuthContext = () => {
  const auth = useAuth();

  // Нормализуем путь для Electron после инициализации роутера
  React.useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'electronAPI' in window &&
      window.location.protocol === 'file:'
    ) {
      const currentPath = window.location.pathname;

      // Если путь всё ещё содержит index.html или абсолютный путь, навигируем на корневой маршрут
      if (currentPath.includes('index.html') || currentPath.match(/^\/[A-Za-z]/)) {
        try {
          router.navigate({ to: '/' });
        } catch {
          // Игнорируем ошибки навигации
        }
      }
    }
  }, []);

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
