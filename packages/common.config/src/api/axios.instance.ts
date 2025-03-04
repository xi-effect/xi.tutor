import axios, { AxiosInstance } from 'axios';
import { redirect } from '@tanstack/react-router'; // Подключаем tanstack-router
import { useAuth } from 'common.config'; // Хук аутентификации

interface AxiosLoader {
  (instance: AxiosInstance): Promise<AxiosInstance>;
}

interface AxiosLoaders {
  request?: AxiosLoader;
  response?: AxiosLoader;
}

// Мы перехватываем все ответы с сервера и при получении ошибки 401,
// принудительно разлогиниваем пользователя и редиректим к форме входа
const createAuthInterceptor = async (instance: AxiosInstance): Promise<AxiosInstance> => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Получаем logout из useAuth и вызываем его
        const { logout } = useAuth();

        logout();

        redirect({
          to: '/signin',
          search: {
            redirect: location.href,
          },
        });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const defaultLoaders: Required<AxiosLoaders> = {
  request: async (instance) => instance,
  response: createAuthInterceptor,
};

const axiosInstance = axios.create({
  headers: { 'Content-type': 'application/json; charset=UTF-8' },
});

export const getAxiosInstance = async (): Promise<AxiosInstance> => {
  const { request = defaultLoaders.request, response = defaultLoaders.response } = defaultLoaders;
  return response(await request(axiosInstance));
};
