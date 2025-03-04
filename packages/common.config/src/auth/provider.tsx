import * as React from 'react';
import { AuthContext } from './context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAxiosInstance } from 'common.config';

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const axiosInst = await getAxiosInstance();
      const res = await axiosInst.get('/api/auth/check');
      return res.data; // Ожидаем, что сервер вернет пользователя или null
    },
    staleTime: 1000 * 60 * 5, // 5 минут
    retry: false,
  });

  const isAuthenticated = !!user;

  const login = async (credentials: { email: string; password: string }) => {
    const axiosInst = await getAxiosInstance();
    const res = await axiosInst.post('/api/auth/login', credentials);
    await queryClient.invalidateQueries({ queryKey: ['auth'] }); // Обновляем авторизацию
    return res.data;
  };

  const logout = async () => {
    const axiosInst = await getAxiosInstance();
    await axiosInst.post('/api/auth/logout');
    await queryClient.invalidateQueries({ queryKey: ['auth'] });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
