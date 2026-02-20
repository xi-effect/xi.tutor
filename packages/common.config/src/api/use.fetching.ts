/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from './axios.instance';
import { AxiosError } from 'axios';

type ApiConfig = {
  method: string;
  getUrl: (params?: Record<string, unknown>) => string;
  headers?: { [key: string]: string | boolean };
};

type UseFetchingProps = {
  apiConfig: ApiConfig;
  disabled?: boolean;
  urlParams?: Record<string, unknown>;
  queryKey: (string | number)[];
  data?: any; // Новый параметр для передачи тела запроса
};

export const useFetching = ({
  apiConfig,
  disabled = false,
  urlParams,
  queryKey,
  data,
}: UseFetchingProps) => {
  const { method, getUrl, headers } = apiConfig;
  const url = useMemo(() => getUrl(urlParams), [getUrl, urlParams]);

  const queryFn = useCallback(async () => {
    if (disabled) return null;

    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance({ method, url, data, headers });
      return response.data;
    } catch (error: unknown) {
      const errorStatus = error instanceof AxiosError ? error.response?.status : null;

      if (errorStatus !== 401 && errorStatus !== 409) {
        console.error('Ошибка при получении данных:', error);
      }

      throw error;
    }
  }, [disabled, method, url, headers, data]);

  return useQuery({
    queryKey,
    queryFn,
    enabled: !disabled,
  });
};
