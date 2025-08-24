/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNetworkControl } from './useNetworkControl';

/**
 * Хук для интеграции сетевой системы с системой авторизации
 * Автоматически подавляет сетевые уведомления при ошибках авторизации
 */
export const useNetworkAuthIntegration = () => {
  const { setAuthErrorDetected } = useNetworkControl();

  // Функция для установки флага ошибки авторизации
  const setAuthError = (hasError: boolean) => {
    setAuthErrorDetected(hasError);
  };

  // Функция для обработки ошибок авторизации
  const handleAuthError = (error: any) => {
    const isAuthError =
      error?.response?.status === 401 ||
      error?.response?.status === 403 ||
      error?.response?.data?.detail === 'User not found' ||
      error?.response?.data?.detail === 'Wrong password';

    if (isAuthError) {
      setAuthErrorDetected(true);
      // Сбрасываем флаг через некоторое время
      setTimeout(() => {
        setAuthErrorDetected(false);
      }, 5000);
    }
  };

  return {
    setAuthError,
    handleAuthError,
  };
};
