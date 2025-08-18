import { useRef, useCallback } from 'react';
import { useNetworkStatus } from './NetworkContext';
import { toast } from 'sonner';

interface RetryRequest {
  id: string;
  fn: () => Promise<unknown>;
  retryCount: number;
  maxRetries: number;
  timestamp: number;
}

export const useRetryQueue = () => {
  const queueRef = useRef<RetryRequest[]>([]);
  const { isOnline } = useNetworkStatus();

  const addToQueue = useCallback((request: Omit<RetryRequest, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const retryRequest: RetryRequest = {
      ...request,
      id,
      timestamp: Date.now(),
    };

    queueRef.current.push(retryRequest);
    console.log(`Запрос добавлен в очередь повторов: ${id}`);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    queueRef.current = queueRef.current.filter((req) => req.id !== id);
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline || queueRef.current.length === 0) {
      return;
    }

    const requests = [...queueRef.current];
    queueRef.current = [];

    console.log(`Обрабатываем очередь из ${requests.length} запросов`);

    for (const request of requests) {
      try {
        if (request.retryCount < request.maxRetries) {
          await request.fn();
          console.log(`Запрос ${request.id} успешно выполнен`);
        } else {
          console.warn(`Запрос ${request.id} превысил максимальное количество попыток`);
        }
      } catch (error) {
        console.error(`Ошибка при повторе запроса ${request.id}:`, error);

        // Если запрос снова не удался, добавляем обратно в очередь
        if (request.retryCount < request.maxRetries) {
          const updatedRequest: RetryRequest = {
            ...request,
            retryCount: request.retryCount + 1,
          };
          queueRef.current.push(updatedRequest);
        }
      }
    }
  }, [isOnline]);

  const clearQueue = useCallback(() => {
    const queueLength = queueRef.current.length;
    queueRef.current = [];
    console.log(`Очередь повторов очищена (было ${queueLength} запросов)`);

    // Показываем уведомление об очистке
    if (queueLength > 0) {
      toast.info('Очередь отложенных запросов очищена', {
        duration: 3000,
        description: `Отменено ${queueLength} запросов`,
      });
    }
  }, []);

  const getQueueLength = useCallback(() => {
    return queueRef.current.length;
  }, []);

  return {
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    getQueueLength,
    isOnline,
  };
};
