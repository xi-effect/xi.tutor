import { useCallback } from 'react';
import { useRetryQueue } from 'common.utils';
import { toast } from 'sonner';

export const useNetworkRetryWithToast = () => {
  const { addToQueue, getQueueLength } = useRetryQueue();

  const retryWithNotification = useCallback(
    (fn: () => Promise<unknown>, maxRetries: number = 3, description?: string) => {
      return new Promise((resolve, reject) => {
        const executeRequest = async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            // Если это сетевая ошибка, добавляем в очередь повторов
            if (error && typeof error === 'object' && 'code' in error) {
              const axiosError = error as { code?: string };
              if (
                axiosError.code &&
                ['ERR_NETWORK', 'ECONNABORTED', 'ERR_BAD_RESPONSE'].includes(axiosError.code)
              ) {
                addToQueue({
                  fn: executeRequest,
                  retryCount: 0,
                  maxRetries,
                });

                const queueLength = getQueueLength();

                // Показываем уведомление с возможностью отмены
                const toastId = toast.info(
                  description || 'Запрос будет повторен при восстановлении соединения',
                  {
                    duration: 0, // Показываем до восстановления соединения
                    description: `В очереди: ${queueLength} запросов`,
                    action: {
                      label: 'Отменить',
                      onClick: () => {
                        toast.dismiss(toastId);
                        reject(new Error('Запрос отменен пользователем'));
                      },
                    },
                  },
                );

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

  return { retryWithNotification };
};
