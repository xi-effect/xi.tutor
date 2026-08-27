import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
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

/** Тема с html — совпадает с тем, что реально нарисовано, даже если React-контекст отстаёт. */
const useDocumentTheme = (): 'light' | 'dark' =>
  useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
      return () => observer.disconnect();
    },
    () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'),
    () => 'light',
  );

/** Инлайн, чтобы перебить CSS, который Sonner вставляет в head после наших стилей. */
const SONNER_THEME_STYLE = {
  '--normal-bg': 'var(--xi-background-surface)',
  '--normal-bg-hover': 'var(--xi-background-subtle)',
  '--normal-border': 'var(--xi-border-default)',
  '--normal-border-hover': 'var(--xi-border-control)',
  '--normal-text': 'var(--xi-text-primary)',
  '--success-bg': 'var(--xi-status-success-background)',
  '--success-border': 'var(--xi-status-success-accent)',
  '--success-text': 'var(--xi-status-success-text)',
  '--info-bg': 'var(--xi-status-info-background)',
  '--info-border': 'var(--xi-status-info-accent)',
  '--info-text': 'var(--xi-status-info-text)',
  '--warning-bg': 'var(--xi-status-warning-background)',
  '--warning-border': 'var(--xi-status-warning-accent)',
  '--warning-text': 'var(--xi-status-warning-text)',
  '--error-bg': 'var(--xi-status-error-background)',
  '--error-border': 'var(--xi-status-error-accent)',
  '--error-text': 'var(--xi-status-error-text)',
} as CSSProperties;

const AppToaster = () => {
  const pathname = useRouterPathname();
  const onBoard = isBoardRoute(pathname);
  const theme = useDocumentTheme();

  return (
    <Toaster
      theme={theme}
      visibleToasts={3}
      expand
      closeButton
      offset={onBoard ? BOARD_TOAST_OFFSET : undefined}
      mobileOffset={onBoard ? BOARD_TOAST_MOBILE_OFFSET : undefined}
      style={SONNER_THEME_STYLE}
    />
  );
};

const RouterWithAuthContext = () => {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const wasAuthenticated = useRef(auth.isAuthenticated);

  useEffect(() => {
    const hadSession = wasAuthenticated.current;
    wasAuthenticated.current = auth.isAuthenticated;

    if (!hadSession || auth.isAuthenticated) return;

    // Radix Dialog может оставить pointer-events: none на body, если
    // модалка размонтируется вместе с защищённым лейаутом, не закрывшись.
    const unlockBody = () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      document.body.removeAttribute('data-scroll-locked');
    };

    unlockBody();
    void router.navigate({ to: '/signin', replace: true }).finally(() => {
      unlockBody();
      queryClient.clear();
    });
  }, [auth.isAuthenticated, queryClient]);

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
