import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { userApiConfig, UserQueryKey } from 'common.api';
import { LoadingScreen } from 'common.ui';
import { useSignup, useSignout, useNetworkAuthIntegration } from 'common.services';
import { trackUmamiSession } from 'common.utils';
import { AuthContext } from './context';
import { SignupData } from 'common.types';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [hasTrackedSessionInit, setHasTrackedSessionInit] = React.useState(false);
  const hasEverBeenUnauthenticated = React.useRef(false);
  const { handleAuthError } = useNetworkAuthIntegration();

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  const {
    data: user,
    isSuccess,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [UserQueryKey.Home],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();
      const res = await axiosInst.get(userApiConfig[UserQueryKey.Home].getUrl());
      return res.data;
    },
    retry: false,
  });

  // Только 401 считаем «пользователь не залогинен» для блокировки session_init identify (signin/signup делают свой).
  // Сетевая/5xx не должны навсегда блокировать identify при следующей успешной загрузке.
  const isUnauthorized =
    isError &&
    error &&
    typeof error === 'object' &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 401;

  React.useEffect(() => {
    if (isUnauthorized) {
      hasEverBeenUnauthenticated.current = true;
    }
    if (isError) {
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
    await refetch();
  };

  const { signout: signoutService } = useSignout();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await signoutService.mutateAsync();
    },

    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear();
    },

    onError: (error) => {
      console.error('Ошибка при выходе из системы:', error);
      handleAuthError(error);
      throw error;
    },
  });

  const logout = () => {
    logoutMutation.mutate();
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
      }
      return result;
    },

    onError: (error) => {
      handleAuthError(error);
      throw error;
    },
  });

  const signup = singupMutation;

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
