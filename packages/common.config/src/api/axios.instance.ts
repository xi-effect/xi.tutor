import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

interface AxiosLoader {
  (instance: AxiosInstance): Promise<AxiosInstance>;
}

interface AxiosLoaders {
  request?: AxiosLoader;
  response?: AxiosLoader;
}

const shownErrors = new Set<string>();

const getErrorKey = (error: AxiosError): string => {
  const url = error.config?.url || 'unknown';
  const method = error.config?.method || 'unknown';
  const code = error.code || 'unknown';
  const status = error.response?.status || 'no-status';

  return `${method}:${url}:${code}:${status}`;
};

const isMultipartUploadError = (error: AxiosError): boolean => {
  const method = error.config?.method?.toLowerCase();
  if (method !== 'post' && method !== 'put' && method !== 'patch') {
    return false;
  }

  const data = error.config?.data;
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    return true;
  }

  const contentType = String(
    error.config?.headers?.['Content-Type'] ?? error.config?.headers?.['content-type'] ?? '',
  );

  return contentType.includes('multipart/form-data');
};

const showOfflineToastOnce = (errorKey: string) => {
  if (shownErrors.has(errorKey)) {
    return;
  }

  shownErrors.add(errorKey);
  toast.error('Нет интернет-соединения. Проверьте подключение к сети.', {
    duration: 5000,
    description: 'Попробуйте обновить страницу или проверить настройки сети.',
  });

  setTimeout(() => {
    shownErrors.delete(errorKey);
  }, 10000);
};

/**
 * Глобально — только реальный offline.
 * 4xx/5xx и CORS/Network Error обрабатывают конкретные экраны (handleError, формы, очередь загрузки).
 */
const createNetworkErrorInterceptor = async (instance: AxiosInstance): Promise<AxiosInstance> => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const isAuthError =
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.config?.url?.includes('/user-service/users/current/home/');

      if (isAuthError || isMultipartUploadError(error) || error.code === 'ERR_CANCELED') {
        return Promise.reject(error);
      }

      const hasHttpStatus = Boolean(error.response?.status);
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

      if (!hasHttpStatus && isOffline) {
        showOfflineToastOnce(getErrorKey(error));
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

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
