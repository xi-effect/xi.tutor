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
    if (isSuccess && user && !hasTrackedSessionInit) {
      setIsAuthenticated(true);
      // Трекинг сессии для уже авторизованного пользователя при инициализации (только один раз)
      trackUmamiSession(user, 'session_init').catch((error) => {
        console.error('Failed to track Umami session:', error);
      });
      setHasTrackedSessionInit(true);
    }
    if (isError) {
      setIsAuthenticated(false);
      // Здесь можно выполнить и другие действия, которые раньше были в onSuccess
    }
  }, [isSuccess, isError, user, hasTrackedSessionInit]);

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
      return await signupService(userData);
    },

    onSuccess: async () => {
      setIsAuthenticated(true);
      const result = await refetch();
      // Трекинг сессии после успешной регистрации
      if (result.data) {
        trackUmamiSession(result.data, 'signup').catch((error) => {
          console.error('Failed to track Umami session:', error);
        });
      }
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
