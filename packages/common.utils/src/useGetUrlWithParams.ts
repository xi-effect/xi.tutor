import { useMemo } from 'react';

// Сохраняем уникальные параметры при редиректе
export const useGetUrlWithParams = () => {
  const params = useMemo(() => {
    return new URLSearchParams(window.location.search);
  }, []);

  const queryString = useMemo(() => {
    return params.toString();
  }, [params]);

  const getUrlWithParams = (url: string) => (queryString ? `${url}?${params}` : url);
  return getUrlWithParams;
};
