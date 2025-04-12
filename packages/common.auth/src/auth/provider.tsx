import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { userApiConfig, UserQueryKey } from 'common.api';
import { LoadingScreen } from 'common.ui';
import { useSignup } from 'common.services';

import { AuthContext } from './context';
import { SignupData } from 'common.types';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

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

  const logout = () => {
    setIsAuthenticated(false);
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

  console.log('AuthProvider', isAuthenticated);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
