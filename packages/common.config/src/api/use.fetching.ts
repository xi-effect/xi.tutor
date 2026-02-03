/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from 'react';
import { useQuery, QueryObserverResult } from '@tanstack/react-query';
import { getAxiosInstance } from './axios.instance';

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
  refetchInterval?:
    | number
    | false
    | ((data: any, query: QueryObserverResult<any, unknown>) => number | false);
};

export const useFetching = ({
  apiConfig,
  disabled = false,
  urlParams,
  queryKey,
  data,
  refetchInterval,
}: UseFetchingProps) => {
  const { method, getUrl, headers } = apiConfig;
  const url = useMemo(() => getUrl(urlParams), [getUrl, urlParams]);

  const queryFn = useCallback(async () => {
    if (disabled) return null;

    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance({ method, url, data, headers });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      throw error;
    }
  }, [disabled, method, url, headers, data]);

  return useQuery({
    queryKey,
    queryFn,
    enabled: !disabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: refetchInterval as number | false,
  });
};
