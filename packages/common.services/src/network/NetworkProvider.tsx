import React, { useEffect } from 'react';
import { useRetryQueue } from 'common.utils';
import { NetworkProvider as NetworkContextProvider, useNetworkStatus } from 'common.utils';
import { toast } from 'sonner';
import { setRetryFunction } from 'common.config';
import { useNetworkRetry } from './useNetworkRetry';

interface NetworkProviderProps {
  children: React.ReactNode;
}

const NetworkProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOnline, lastOnlineTime } = useNetworkStatus();
  const { processQueue, getQueueLength } = useRetryQueue();
  const { retryOnReconnect } = useNetworkRetry();

  // Устанавливаем функцию повтора для axios
  useEffect(() => {
    setRetryFunction(retryOnReconnect);
  }, [retryOnReconnect]);

  // Обрабатываем очередь повторов при восстановлении соединения
  useEffect(() => {
    if (isOnline && lastOnlineTime) {
      const queueLength = getQueueLength();
      if (queueLength > 0) {
        console.log(`Восстановлено соединение, обрабатываем ${queueLength} отложенных запросов`);

        // Показываем уведомление о начале обработки очереди
        toast.info(`Обрабатываем ${queueLength} отложенных запросов`, {
          duration: 3000,
        });

        // Обрабатываем очередь с небольшой задержкой
        setTimeout(() => {
          processQueue();
        }, 1000);
      }
    }
  }, [isOnline, lastOnlineTime, processQueue, getQueueLength]);

  return <>{children}</>;
};

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  return (
    <NetworkContextProvider>
      <NetworkProviderContent>{children}</NetworkProviderContent>
    </NetworkContextProvider>
  );
};
