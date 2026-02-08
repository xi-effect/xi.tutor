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

  React.useEffect(() => {
    if (isError) {
      hasEverBeenUnauthenticated.current = true;
      setIsAuthenticated(false);
    }
  }, [isError]);

  React.useEffect(() => {
    if (isSuccess && user && !hasTrackedSessionInit) {
      setIsAuthenticated(true);
      // Трекинг только для «восстановленной» сессии (пользователь уже был авторизован при загрузке).
      // После signin/signup идентификацию делают useSigninForm и signup onSuccess — не дублируем.
      if (!hasEverBeenUnauthenticated.current) {
        trackUmamiSession(user, 'session_init').catch((error) => {
          console.error('Failed to track Umami session:', error);
        });
      }
      setHasTrackedSessionInit(true);
    }
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
