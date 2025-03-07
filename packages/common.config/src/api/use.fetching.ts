import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAxiosInstance } from './axios.instance';

type ApiConfig = {
  method: string;
  getUrl: (params?: Record<string, unknown>) => string;
};

type UseFetchingProps = {
  apiConfig: ApiConfig;
  disabled?: boolean;
  urlParams?: Record<string, unknown>;
  queryKey: (string | number)[];
};

export const useFetching = ({
  apiConfig,
  disabled = false,
  urlParams,
  queryKey,
}: UseFetchingProps) => {
  const { method, getUrl } = apiConfig;
  const url = useMemo(() => getUrl(urlParams), [getUrl, urlParams]);

  const queryFn = useCallback(async () => {
    if (disabled) return null;

    try {
      const axiosInstance = await getAxiosInstance();
      const response = await axiosInstance({ method, url });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      throw error;
    }
  }, [disabled, method, url]);

  return useQuery({
    queryKey,
    queryFn,
  });
};
