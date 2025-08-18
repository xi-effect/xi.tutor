import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Глобальная переменная для хранения функции повтора
let retryFunction:
  | ((fn: () => Promise<unknown>, maxRetries?: number, description?: string) => Promise<unknown>)
  | null = null;

// Функция для установки функции повтора
export const setRetryFunction = (retryFn: typeof retryFunction) => {
  retryFunction = retryFn;
};

interface AxiosLoader {
  (instance: AxiosInstance): Promise<AxiosInstance>;
}

interface AxiosLoaders {
  request?: AxiosLoader;
  response?: AxiosLoader;
}

// Интерцептор для обработки сетевых ошибок и потери интернет-соединения
const createNetworkErrorInterceptor = async (instance: AxiosInstance): Promise<AxiosInstance> => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Проверяем различные типы сетевых ошибок
      if (error.code === 'ERR_NETWORK') {
        // Ошибка сети - нет интернет-соединения
        toast.error('Нет интернет-соединения. Проверьте подключение к сети.', {
          duration: 5000,
          description: 'Попробуйте обновить страницу или проверить настройки сети.',
        });
      } else if (error.code === 'ECONNABORTED') {
        // Таймаут запроса
        toast.error('Превышено время ожидания запроса.', {
          duration: 4000,
          description: 'Сервер не отвечает. Попробуйте позже.',
        });
      } else if (error.code === 'ERR_BAD_REQUEST') {
        // Неверный запрос
        toast.error('Ошибка в запросе к серверу.', {
          duration: 4000,
        });
      } else if (error.code === 'ERR_BAD_RESPONSE') {
        // Неверный ответ сервера
        toast.error('Сервер вернул неверный ответ.', {
          duration: 4000,
          description: 'Попробуйте обновить страницу.',
        });
      } else if (error.code === 'ERR_BAD_OPTION') {
        // Неверная опция в конфигурации
        toast.error('Ошибка конфигурации запроса.', {
          duration: 4000,
        });
      } else if (error.code === 'ERR_CANCELED') {
        // Запрос был отменен
        console.log('Запрос был отменен:', error.message);
        return Promise.reject(error);
      } else if (!error.response) {
        // Общая ошибка сети без конкретного кода
        toast.error('Ошибка сетевого подключения.', {
          duration: 5000,
          description: 'Проверьте интернет-соединение и попробуйте снова.',
        });
      }

      // Если есть функция повтора и это сетевая ошибка, добавляем в очередь
      if (
        retryFunction &&
        ['ERR_NETWORK', 'ECONNABORTED', 'ERR_BAD_RESPONSE'].includes(error.code || '')
      ) {
        // Создаем функцию для повтора запроса
        const retryRequest = () => {
          const config = error.config;
          if (config) {
            return axios.request(config);
          }
          return Promise.reject(error);
        };

        try {
          await retryFunction(
            retryRequest,
            3,
            'Автоматический повтор запроса при восстановлении соединения',
          );
          // Если запрос был добавлен в очередь, не показываем ошибку
          return Promise.reject(new Error('Запрос добавлен в очередь повторов'));
        } catch (retryError) {
          // Если не удалось добавить в очередь, показываем обычную ошибку
          console.warn('Не удалось добавить запрос в очередь повторов:', retryError);
        }
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

// Мы перехватываем все ответы с сервера и при получении ошибки 401,
// принудительно разлогиниваем пользователя и редиректим к форме входа
const createAuthInterceptor = async (instance: AxiosInstance): Promise<AxiosInstance> => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.log('createAuthInterceptor 401');

        // Получаем logout из useAuth и вызываем его
        // const { logout } = useAuth();

        // logout();

        // redirect({
        //   to: '/signin',
        //   search: {
        //     redirect: location.href,
        //   },
        // });
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

const defaultLoaders: Required<AxiosLoaders> = {
  request: async (instance) => instance,
  response: async (instance) => {
    // Применяем интерцепторы в правильном порядке
    const instanceWithNetworkErrors = await createNetworkErrorInterceptor(instance);
    const instanceWithAuth = await createAuthInterceptor(instanceWithNetworkErrors);
    return instanceWithAuth;
  },
};

const axiosInstance = axios.create({
  withCredentials: true,
  headers: { 'Content-type': 'application/json; charset=UTF-8' },
});

export const getAxiosInstance = async (): Promise<AxiosInstance> => {
  const { request = defaultLoaders.request, response = defaultLoaders.response } = defaultLoaders;
  return response(await request(axiosInstance));
};
