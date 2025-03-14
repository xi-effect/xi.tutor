import * as React from 'react';
import { AuthContext } from './context';
import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';
import { userApiConfig, UserQueryKey } from 'common.api';
import { LoadingScreen } from 'common.ui';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  const {
    data: user,
    isSuccess,
    isError,
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

  console.log('AuthProvider', isAuthenticated);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
