import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { userApiConfig, UserQueryKey } from 'common.api';
import { LoadingScreen } from 'common.ui';
import { useSignup, useSignout } from 'common.services';
import { AuthContext } from './context';
import { SignupData } from 'common.types';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

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
    if (isSuccess && user) {
      setIsAuthenticated(true);
      // Здесь можно выполнить и другие действия, которые раньше были в onSuccess
    }
    if (isError) {
      setIsAuthenticated(false);
      // Здесь можно выполнить и другие действия, которые раньше были в onSuccess
    }
  }, [isSuccess, isError, user]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const { signout: signoutService } = useSignout();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await signoutService.mutateAsync();
    },

    onSuccess: () => {
      setIsAuthenticated(false);
    },

    onError: (error) => {
      console.error('Ошибка при выходе из системы:', error);
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
      await refetch();
    },

    onError: (error) => {
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
