import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import { Suspense, useEffect } from 'react';
import { useCurrentUser } from 'common.services';
import { onboardingStageToPath } from 'pages.welcome';
import { OnboardingStageT } from 'common.api';
import { LoadingScreen } from 'common.ui';

function LayoutComponent() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Outlet />
    </div>
  );
}

const ProtectedLayout = () => {
  const { data: user, isLoading } = useCurrentUser();
  const navigate = useNavigate();

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

  if (!user || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <LayoutComponent />
    </Suspense>
  );
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const Route = createFileRoute('/(common)/_layout')({
  head: () => ({
    meta: [
      {
        title: 'sovlium | Добро пожаловать',
      },
    ],
  }),
  component: ProtectedLayout,
});
