import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

interface AxiosLoader {
  (instance: AxiosInstance): Promise<AxiosInstance>;
}

interface AxiosLoaders {
  request?: AxiosLoader;
  response?: AxiosLoader;
}

// Хранилище для отслеживания показанных ошибок
const shownErrors = new Set<string>();

// Функция для создания уникального ключа ошибки
const getErrorKey = (error: AxiosError): string => {
  const url = error.config?.url || 'unknown';
  const method = error.config?.method || 'unknown';
  const code = error.code || 'unknown';
  const status = error.response?.status || 'no-status';

  return `${method}:${url}:${code}:${status}`;
};

// Функция для показа toast с дедупликацией
const showToastOnce = (
  errorKey: string,
  message: string,
  options?: { duration?: number; description?: string },
) => {
  if (!shownErrors.has(errorKey)) {
    shownErrors.add(errorKey);
    toast.error(message, options);

    // Очищаем ошибку из кэша через 10 секунд
    setTimeout(() => {
      shownErrors.delete(errorKey);
    }, 10000);
  }
};

// Интерцептор для обработки сетевых ошибок и потери интернет-соединения
const createNetworkErrorInterceptor = async (instance: AxiosInstance): Promise<AxiosInstance> => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Проверяем, является ли ошибка связанной с авторизацией
      const isAuthError =
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.config?.url?.includes('/user-service/users/current/home/');

      // Если это ошибка авторизации, не показываем сетевые уведомления
      if (isAuthError) {
        return Promise.reject(error);
      }

      const errorKey = getErrorKey(error);
      const url = error.config?.url || '';

      // Проверяем, является ли запрос связанным с уведомлениями (аватары)
      // Эти запросы могут возвращать 403/404, но не должны показывать toast пользователю
      const isNotificationRelatedRequest =
        url.includes('/roles/student/classrooms/') ||
        url.includes('/roles/tutor/students/') ||
        url.includes('/roles/tutor/classrooms/') ||
        url.includes('/roles/tutor/recipient-invoices/') ||
        url.includes('/roles/student/recipient-invoices/');

      // Сначала проверяем HTTP статус-коды, если они есть
      if (error.response?.status) {
        const status = error.response.status;

        if (status >= 500) {
          // Ошибки сервера (5xx)
          showToastOnce(errorKey, 'Ошибка сервера. Попробуйте позже.', {
            duration: 4000,
            description: `Сервер вернул ошибку ${status}.`,
          });
        } else if (status === 404) {
          // Ресурс не найден
          // Не показываем toast для запросов, связанных с уведомлениями
          if (!isNotificationRelatedRequest) {
            showToastOnce(errorKey, 'Запрашиваемый ресурс не найден.', {
              duration: 3000,
              description: 'Возможно, страница была перемещена или удалена.',
            });
          }
        } else if (status === 403) {
          // Доступ запрещен
          // Не показываем toast для запросов, связанных с уведомлениями
          if (!isNotificationRelatedRequest) {
            showToastOnce(errorKey, 'Доступ запрещен.', {
              duration: 3000,
              description: 'У вас нет прав для выполнения этого действия.',
            });
          }
        } else if (status >= 400 && status < 500 && status !== 409) {
          // Остальные клиентские ошибки (4xx)
          showToastOnce(errorKey, 'Ошибка в запросе.', {
            duration: 3000,
            description: `Сервер вернул ошибку ${status}.`,
          });
        } else if (status === 409) {
          // Комната не активна
        }

        return Promise.reject(error);
      }

      // Проверяем различные типы сетевых ошибок
      if (error.code === 'ERR_NETWORK') {
        // ERR_NETWORK может означать разные вещи:
        // 1. Нет интернета (navigator.onLine === false)
        // 2. Сервер недоступен (CORS, DNS, сервер не отвечает)
        // 3. Блокировка файрволом

        if (!navigator.onLine) {
          // Реально нет интернета
          showToastOnce(errorKey, 'Нет интернет-соединения. Проверьте подключение к сети.', {
            duration: 5000,
            description: 'Попробуйте обновить страницу или проверить настройки сети.',
          });
        } else {
          // Интернет есть, но сервер недоступен
          showToastOnce(errorKey, 'Сервер недоступен. Попробуйте позже.', {
            duration: 4000,
            description: 'Возможно, сервер временно недоступен или перегружен.',
          });
        }
      } else if (error.code === 'ECONNABORTED') {
        // Таймаут запроса
        showToastOnce(errorKey, 'Превышено время ожидания запроса.', {
          duration: 4000,
          description: 'Сервер не отвечает. Попробуйте позже.',
        });
      } else if (error.code === 'ERR_BAD_REQUEST') {
        // Неверный запрос
        showToastOnce(errorKey, 'Ошибка в запросе к серверу.', {
          duration: 4000,
        });
      } else if (error.code === 'ERR_BAD_RESPONSE') {
        // Неверный ответ сервера
        showToastOnce(errorKey, 'Сервер вернул неверный ответ.', {
          duration: 4000,
          description: 'Попробуйте обновить страницу.',
        });
      } else if (error.code === 'ERR_BAD_OPTION') {
        // Неверная опция в конфигурации
        showToastOnce(errorKey, 'Ошибка конфигурации запроса.', {
          duration: 4000,
        });
      } else if (error.code === 'ERR_CANCELED') {
        // Запрос был отменен
        console.log('Запрос был отменен:', error.message);
        return Promise.reject(error);
      } else if (!error.response && !error.code) {
        // Общая ошибка сети без конкретного кода
        showToastOnce(errorKey, 'Ошибка сетевого подключения.', {
          duration: 5000,
          description: 'Проверьте интернет-соединение и попробуйте снова.',
        });
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
