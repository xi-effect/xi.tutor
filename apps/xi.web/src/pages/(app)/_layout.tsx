/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet, createFileRoute, useNavigate, useRouter, useSearch } from '@tanstack/react-router';
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
import { useCurrentUser, useUpdateProfile } from 'common.services';
import { OnboardingStageT } from 'common.api';
import { onboardingStageToPath } from 'pages.welcome';
import { RoleT } from 'common.types';

// Динамические импорты для крупных модулей
const Navigation = lazy(() =>
  import('modules.navigation').then((module) => ({ default: module.Navigation })),
);

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
                <CompactView>
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

const ProtectedLayout = () => {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { role?: RoleT };
  const { updateProfile } = useUpdateProfile();

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

  // Обработка параметра role из URL
  useEffect(() => {
    if (!user || !search.role) return;

    const urlRole = search.role;
    const currentLayout = user.default_layout;

    // Проверяем, является ли role валидным значением
    if (urlRole !== 'tutor' && urlRole !== 'student') return;

    // Если role совпадает с текущим default_layout, просто удаляем параметр из URL
    if (urlRole === currentLayout) {
      const newSearch = { ...search };
      delete newSearch.role;
      navigate({
        search: newSearch as any,
        replace: true,
      });
      return;
    }

    // Если role отличается от currentLayout, обновляем default_layout
    updateProfile.mutate(
      { default_layout: urlRole },
      {
        onSuccess: () => {
          // Удаляем параметр role из URL после успешного обновления
          const newSearch = { ...search };
          delete newSearch.role;
          navigate({
            search: newSearch as any,
            replace: true,
          });
        },
      },
    );
  }, []);

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
