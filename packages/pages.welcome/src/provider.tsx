import React, { useEffect } from 'react';
import { useRouterState, redirect } from '@tanstack/react-router';
import { useAuth } from 'common.auth';
import { WelcomeContext } from './context';
import { useCurrentUser } from 'common.services';
import { LoadingScreen } from 'common.ui';

type ProtectedProviderPropsT = {
  children: React.ReactNode;
};

export const ProtectedProvider = ({ children }: ProtectedProviderPropsT) => {
  const { data: user } = useCurrentUser();
  const { id, email, onboarding_stage } = user;
  const { isAuthenticated } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (
      onboarding_stage &&
      onboarding_stage !== null &&
      onboarding_stage !== 'completed' &&
      !pathname.includes('/welcome/')
    ) {
      redirect({ to: '/welcome/user' });
    }
  }, [isAuthenticated, onboarding_stage, pathname]);

  if (isAuthenticated === null) return <LoadingScreen />;

  return (
    <WelcomeContext.Provider value={{ id, email, onboarding_stage }}>
      {children}
    </WelcomeContext.Provider>
  );
};

export default ProtectedProvider;
