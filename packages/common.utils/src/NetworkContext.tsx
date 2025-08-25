import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

const NetworkContext = createContext<NetworkStatus | null>(null);

interface NetworkProviderProps {
  children: ReactNode;
  shouldShowNotification?: () => boolean;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
  shouldShowNotification = () => true,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [lastToastTime, setLastToastTime] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      const now = Date.now();
      setIsOnline(true);
      setIsReconnecting(false);
      setLastOnlineTime(new Date());

      // Показываем уведомление только если разрешено и прошло больше 2 секунд с последнего
      if (shouldShowNotification() && now - lastToastTime > 2000) {
        setLastToastTime(now);
        toast.success('Интернет-соединение восстановлено', {
          duration: 3000,
          description: 'Теперь можно продолжить работу.',
        });
      }
    };

    const handleOffline = () => {
      const now = Date.now();
      setIsOnline(false);
      setLastOfflineTime(new Date());

      // Показываем уведомление только если разрешено и прошло больше 2 секунд с последнего
      if (shouldShowNotification() && now - lastToastTime > 2000) {
        setLastToastTime(now);
        toast.error('Интернет-соединение потеряно', {
          duration: 0,
          description: 'Проверьте подключение к сети.',
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lastToastTime, shouldShowNotification]);

  const value: NetworkStatus = {
    isOnline,
    isReconnecting,
    lastOnlineTime,
    lastOfflineTime,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

export const useNetworkStatus = (): NetworkStatus => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within NetworkProvider');
  }
  return context;
};
