import React, { useEffect } from 'react';
import { useRouterState, useRouter, useSearch } from '@tanstack/react-router';
import { useAuth } from 'common.auth';
import { WelcomeContext } from '../model/WelcomeContext';
import { useCurrentUser } from 'common.services';
import { LoadingScreen } from 'common.ui';
import { onboardingStageToPath } from '../utils';
import { OnboardingStageT } from '../../../common.api/src/types';

type ProtectedProviderPropsT = {
  children: React.ReactNode;
};

export const ProtectedProvider = ({ children }: ProtectedProviderPropsT) => {
  const { data: user } = useCurrentUser();
  const { id, email, display_name, onboarding_stage } = user;
  const { isAuthenticated } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const search = useSearch({ strict: false });

  const router = useRouter();

  useEffect(() => {
    if (!user || isAuthenticated === null) return;

    // Проверяем, находимся ли мы в welcome-процессе
    const isInWelcomeProcess = pathname.startsWith('/welcome');

    // Если onboarding завершен или в стадии training, и мы на welcome-странице - редиректим на главную
    if (
      (onboarding_stage === 'completed' || onboarding_stage === 'training') &&
      isInWelcomeProcess
    ) {
      router.navigate({ to: '/', search: { ...search } });
      return;
    }

    if (onboarding_stage === 'completed') return;

    // Проверяем, есть ли invite параметр в search
    const hasInvite = search && typeof search === 'object' && 'invite' in search && search.invite;

    // Если есть invite и мы на invite-странице, не редиректим
    if (hasInvite && pathname.startsWith('/invite/')) return;

    const expectedPath = onboardingStageToPath[onboarding_stage as OnboardingStageT];

    if (!expectedPath) return;

    // Редиректим если мы не на правильном пути (даже если мы уже в welcome-процессе)
    if (pathname !== expectedPath) {
      router.navigate({ to: expectedPath, search: { ...search } });
    }
  }, [user, pathname, isAuthenticated, router, onboarding_stage, search]);

  if (isAuthenticated === null) return <LoadingScreen />;

  return (
    <WelcomeContext.Provider value={{ id, email, display_name, onboarding_stage }}>
      {children}
    </WelcomeContext.Provider>
  );
};

export default ProtectedProvider;
