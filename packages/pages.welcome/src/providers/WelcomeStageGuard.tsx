import { ReactNode, useEffect } from 'react';
import { useRouter, useRouterState, useSearch } from '@tanstack/react-router';
import { useAuth } from 'common.auth';
import { useCurrentUser } from 'common.services';
import { LoadingScreen } from 'common.ui';
import { resolveWelcomeGuardAction } from './welcomeGuardLogic';

type WelcomeStageGuardPropsT = {
  children: ReactNode;
};

/**
 * Тот же редирект, что у ProtectedProvider, но дети не рисуются,
 * пока стадия онбординга не совпадает с текущим путём.
 * Нужен экрану ожидания почты: он не обёрнут в WelcomePageLayout.
 */
export const WelcomeStageGuard = ({ children }: WelcomeStageGuardPropsT) => {
  const { data: user, isError } = useCurrentUser();
  const { isAuthenticated } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const search = useSearch({ strict: false });
  const router = useRouter();

  const hasInvite =
    Boolean(search) && typeof search === 'object' && 'invite' in search && Boolean(search.invite);

  const action =
    user && isAuthenticated !== null
      ? resolveWelcomeGuardAction({
          onboardingStage: user.onboarding_stage,
          pathname,
          hasInvite,
        })
      : null;
  const redirectTo = action?.type === 'navigate' ? action.to : null;

  useEffect(() => {
    if (!redirectTo) return;

    router.navigate({ to: redirectTo, search: { ...search }, replace: true });
  }, [redirectTo, router, search]);

  if (isAuthenticated === null || (!user && !isError) || redirectTo) {
    return <LoadingScreen />;
  }

  return children;
};
