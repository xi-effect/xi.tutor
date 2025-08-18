/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { useRetryQueue } from 'common.utils';
import { toast } from 'sonner';

export const useNetworkRetry = () => {
  const { addToQueue, getQueueLength } = useRetryQueue();

  const retryOnReconnect = useCallback(
    (fn: () => Promise<any>, maxRetries: number = 3, description?: string) => {
      return new Promise((resolve, reject) => {
        const executeRequest = async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            // Если это сетевая ошибка, добавляем в очередь повторов
            if (error && typeof error === 'object' && 'code' in error) {
              const axiosError = error as any;
              if (['ERR_NETWORK', 'ECONNABORTED', 'ERR_BAD_RESPONSE'].includes(axiosError.code)) {
                addToQueue({
                  fn: executeRequest,
                  retryCount: 0,
                  maxRetries,
                });

                const queueLength = getQueueLength();
                toast.info(description || 'Запрос будет повторен при восстановлении соединения', {
                  duration: 4000,
                  description: `В очереди: ${queueLength} запросов`,
                });

                reject(new Error('Запрос добавлен в очередь повторов'));
                return;
              }
            }

            reject(error);
          }
        };

        executeRequest();
      });
    },
    [addToQueue, getQueueLength],
  );

  return { retryOnReconnect };
};
