import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingScreen } from 'common.ui';
import {
  useSignup,
  useSignout,
  useNetworkAuthIntegration,
  useCurrentUser,
  isAuthFailureError,
  resolveAuthState,
  useSessionRestoreNetworkToast,
} from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getProductAnalyticsRole,
  trackOnce,
  trackProductEvent,
  trackUmamiSession,
} from 'common.utils';
import { AuthContext } from './context';
import { SignupData } from 'common.types';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [hasTrackedSessionInit, setHasTrackedSessionInit] = React.useState(false);
  const hasEverBeenUnauthenticated = React.useRef(false);
  const { handleAuthError } = useNetworkAuthIntegration();

  const {
    data: user,
    isSuccess,
    error,
    failureReason,
    isFetching,
    failureCount,
    refetch,
  } = useCurrentUser(isAuthenticated === false);

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  const authError = error ?? failureReason;

  const resolvedAuth = resolveAuthState({
    isAuthenticated,
    isSuccess,
    user,
    isFetching,
    error: authError,
  });

  useSessionRestoreNetworkToast({
    isSessionUnresolved: resolvedAuth === null,
    failureCount,
    error: authError,
  });

  React.useEffect(() => {
    if (resolvedAuth !== false) return;
    if (isAuthFailureError(authError)) {
      hasEverBeenUnauthenticated.current = true;
    }
    setIsAuthenticated(false);
  }, [resolvedAuth, authError]);

  React.useEffect(() => {
    if (!isSuccess || !user || hasTrackedSessionInit) return;

    setIsAuthenticated(true);

    // Identify только для «восстановленной» сессии (загрузка с уже валидными куками).
    // После signin/signup идентификацию делают useSigninForm и signup — не дублируем.
    if (hasEverBeenUnauthenticated.current) {
      setHasTrackedSessionInit(true);
      return;
    }

    setHasTrackedSessionInit(true);

    trackUmamiSession(user, 'session_init').catch((err) => {
      console.error('Failed to track Umami session:', err);
    });
  }, [isSuccess, user, hasTrackedSessionInit]);

  const login = async () => {
    setIsAuthenticated(true);
    const result = await refetch();
    return result.data;
  };

  const { signout: signoutService } = useSignout();

  const logout = async () => {
    hasEverBeenUnauthenticated.current = true;
    setIsAuthenticated(false);

    void signoutService.mutateAsync().catch((error) => {
      console.error('Ошибка при выходе из системы:', error);
      handleAuthError(error);
    });
  };

  const { signup: signupService } = useSignup();

  const singupMutation = useMutation({
    mutationFn: async (userData: SignupData) => {
      const result = await signupService(userData);
      setIsAuthenticated(true);
      const refetched = await refetch();
      // Идентифицируем до того, как форма сделает navigate — чтобы properties записались в текущую сессию
      if (refetched.data) {
        await trackUmamiSession(refetched.data, 'signup');

        // Один раз на пользователя (клиентский once + localStorage; backend-флага пока нет)
        const storageKey = `auth_first_authenticated_session:${refetched.data.id}`;
        let alreadySent = false;
        try {
          alreadySent = localStorage.getItem(storageKey) === '1';
        } catch {
          alreadySent = false;
        }

        if (!alreadySent) {
          const role = getProductAnalyticsRole(refetched.data.default_layout);
          trackOnce(storageKey, () => {
            trackProductEvent(PRODUCT_ANALYTICS_EVENTS.AUTH_FIRST_AUTHENTICATED_SESSION, {
              user_role: role === 'student' ? 'student' : 'tutor',
              source: 'signup',
            });
          });
          try {
            localStorage.setItem(storageKey, '1');
          } catch {
            // ignore
          }
        }
      }
      return result;
    },

    onError: (error) => {
      handleAuthError(error);
      throw error;
    },
  });

  const signup = singupMutation;

  if (resolvedAuth === null) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: resolvedAuth, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
