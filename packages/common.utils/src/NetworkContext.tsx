import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { toast } from 'sonner';

export interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

const NetworkContext = createContext<NetworkStatus | null>(null);

const NETWORK_TOAST_ID = 'network-status';
const TOAST_GAP_MS = 8000;
const RESTORE_TOAST_AFTER_MS = 4000;

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
  const lastToastAtRef = useRef(0);
  const wentOfflineAtRef = useRef<number | null>(null);
  const shouldShowNotificationRef = useRef(shouldShowNotification);

  useEffect(() => {
    shouldShowNotificationRef.current = shouldShowNotification;
  }, [shouldShowNotification]);

  useEffect(() => {
    const handleOnline = () => {
      const now = Date.now();
      const offlineAt = wentOfflineAtRef.current;
      wentOfflineAtRef.current = null;

      setIsOnline(true);
      setIsReconnecting(false);
      setLastOnlineTime(new Date());

      if (!shouldShowNotificationRef.current()) {
        toast.dismiss(NETWORK_TOAST_ID);
        return;
      }

      if (offlineAt && now - offlineAt < RESTORE_TOAST_AFTER_MS) {
        toast.dismiss(NETWORK_TOAST_ID);
        return;
      }

      lastToastAtRef.current = now;
      toast.success('Соединение восстановлено', {
        id: NETWORK_TOAST_ID,
        duration: 2500,
      });
    };

    const handleOffline = () => {
      const now = Date.now();
      wentOfflineAtRef.current = now;
      setIsOnline(false);
      setLastOfflineTime(new Date());

      if (!shouldShowNotificationRef.current()) return;
      if (now - lastToastAtRef.current < TOAST_GAP_MS) return;

      lastToastAtRef.current = now;
      toast.warning('Нет соединения', {
        id: NETWORK_TOAST_ID,
        description: 'Проверьте подключение к сети.',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
