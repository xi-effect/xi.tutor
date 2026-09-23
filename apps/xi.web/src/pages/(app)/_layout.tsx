/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet, createFileRoute, useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { applyUserLanguage, LoadingScreen } from 'common.ui';
import { Suspense, lazy, useEffect, useRef, useCallback } from 'react';

// Импортируем провайдеры синхронно, так как они нужны везде
import { CallsShell, CompactView, useCallStore, useUmamiActivityHeartbeat } from 'modules.calls';
import { useCurrentUser, useSyncRoleFromSearch, useMarkNotificationAsRead } from 'common.services';
import { OnboardingStageT } from 'common.api';
import { onboardingStageToPath } from 'pages.welcome';
import { RoleT } from 'common.types';

// Динамические импорты для крупных модулей
const Navigation = lazy(() =>
  import('modules.navigation').then((module) => ({ default: module.Navigation })),
);

function LayoutComponent() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <CallsShell>
          <LayoutContent />
        </CallsShell>
      </Suspense>
    </div>
  );
}

function LayoutContent() {
  const router = useRouter();
  const updateStore = useCallStore((state) => state.updateStore);
  const token = useCallStore((state) => state.token);

  useUmamiActivityHeartbeat();

  useEffect(() => {
    const pathname = router.state.location.pathname;
    const search = router.state.location.search;

    if (pathname.includes('/call')) {
      const { activeBoardId, activeClassroom, mode } = useCallStore.getState();
      const hasPendingBoardTransition =
        mode === 'compact' && Boolean(activeBoardId && activeClassroom);
      if (!hasPendingBoardTransition) {
        updateStore('mode', 'full');
      }
    } else if (search.call) {
      // На любой странице (главная, classrooms, materials и т.д.) с параметром call — compact
      updateStore('mode', 'compact');
    }
  }, [router.state.location.pathname, router.state.location.search, updateStore]);

  const outlet = token ? (
    <CompactView>
      <Outlet />
    </CompactView>
  ) : (
    <Outlet />
  );

  return <Navigation>{outlet}</Navigation>;
}

const ProtectedLayout = () => {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { role?: RoleT; read_notification_id?: string };
  const processedNotificationIdRef = useRef<string | null>(null);

  const removeNotificationIdFromUrl = useCallback(() => {
    navigate({
      // @ts-expect-error - TanStack Router search params typing issue
      search: (prev: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { read_notification_id: _, ...rest } = prev || {};
        return rest;
      },
      replace: true,
    });
    processedNotificationIdRef.current = null;
  }, [navigate]);

  const removeRoleFromUrl = useCallback(() => {
    navigate({
      // @ts-expect-error - TanStack Router search params typing issue
      search: (prev: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { role: _, ...rest } = prev || {};
        return rest;
      },
      replace: true,
    });
  }, [navigate]);

  const { markAsRead } = useMarkNotificationAsRead({
    onSuccess: () => {
      // Удаляем параметр read_notification_id из URL после успешного обновления
      removeNotificationIdFromUrl();
    },
    onError: () => {
      // Даже в случае ошибки удаляем параметр из URL, чтобы избежать повторных попыток
      removeNotificationIdFromUrl();
    },
  });

  useEffect(() => {
    void applyUserLanguage(user?.language);
  }, [user?.language]);

  useEffect(() => {
    const stage = user?.onboarding_stage;

    if (
      stage &&
      stage !== 'completed' &&
      stage !== 'training' &&
      Object.prototype.hasOwnProperty.call(onboardingStageToPath, stage)
    ) {
      navigate({ to: onboardingStageToPath[stage as OnboardingStageT] });
    }
  }, [navigate, user?.onboarding_stage]);

  useSyncRoleFromSearch(search.role, removeRoleFromUrl);

  // Обработка параметра read_notification_id из URL
  useEffect(() => {
    if (!user || !search.read_notification_id) return;

    const notificationId = search.read_notification_id;

    // Предотвращаем повторную обработку того же уведомления
    if (processedNotificationIdRef.current === notificationId) return;
    processedNotificationIdRef.current = notificationId;

    // Отмечаем уведомление как прочитанное
    markAsRead.mutate(notificationId);
  }, [user, search.read_notification_id, markAsRead]);

  if (!user || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <LayoutComponent />
    </Suspense>
  );
};

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
  component: ProtectedLayout,
});
