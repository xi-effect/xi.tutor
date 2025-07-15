import React, { useEffect } from 'react';
import { useRouterState, useRouter } from '@tanstack/react-router';
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

  const router = useRouter();

  useEffect(() => {
    if (!user || isAuthenticated === null) return;

    if (onboarding_stage === 'completed') return;

    const expectedPath = onboardingStageToPath[onboarding_stage as OnboardingStageT];

    if (!expectedPath) return;

    if (pathname !== expectedPath) {
      router.navigate({ to: expectedPath });
    }
  }, [user, pathname, isAuthenticated, router, onboarding_stage]);

  if (isAuthenticated === null) return <LoadingScreen />;

  return (
    <WelcomeContext.Provider value={{ id, email, display_name, onboarding_stage }}>
      {children}
    </WelcomeContext.Provider>
  );
};

export default ProtectedProvider;
