import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingScreen } from 'common.ui';
import { useSignup, useSignout, useNetworkAuthIntegration, useCurrentUser } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getProductAnalyticsRole,
  trackOnce,
  trackProductEvent,
  trackUmamiSession,
} from 'common.utils';
import { AuthContext } from './context';
import { SignupData } from 'common.types';

const getHttpStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  const err = error as { response?: { status?: number }; status?: number };
  if (typeof err.response?.status === 'number') return err.response.status;
  if (typeof err.status === 'number') return err.status;
  return undefined;
};

const isAuthFailureStatus = (status: number | undefined) => status === 401 || status === 403;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [hasTrackedSessionInit, setHasTrackedSessionInit] = React.useState(false);
  const hasEverBeenUnauthenticated = React.useRef(false);
  const { handleAuthError } = useNetworkAuthIntegration();

  const {
    data: user,
    isSuccess,
    isError,
    error,
    isFetching,
    refetch,
  } = useCurrentUser(isAuthenticated === false);

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  const httpStatus = getHttpStatus(error);
  const isUnauthorized = isError && isAuthFailureStatus(httpStatus);

  const resolvedAuth: boolean | null = (() => {
    if (isAuthenticated === false) return false;
    if (isSuccess && user) return true;
    // После login() refetch ещё идёт: isError может быть от прошлого 401 — не откатываем.
    if (isError && !isFetching) return false;
    if (isAuthenticated === true) return true;
    return isAuthenticated;
  })();

  React.useEffect(() => {
    if (isUnauthorized) {
      hasEverBeenUnauthenticated.current = true;
      setIsAuthenticated(false);
    } else if (isError) {
      setIsAuthenticated(false);
    }
  }, [isError, isUnauthorized]);

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
