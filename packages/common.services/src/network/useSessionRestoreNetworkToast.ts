import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { isAuthFailureError } from '../user/authCheckError';

export const SESSION_RESTORE_NETWORK_TOAST_ID = 'session-restore-network';
export const SESSION_RESTORE_NETWORK_TOAST_DELAY_MS = 800;

export const shouldNotifySessionRestoreNetwork = ({
  isSessionUnresolved,
  failureCount,
  error,
  isOnline,
}: {
  isSessionUnresolved: boolean;
  failureCount: number;
  error: unknown;
  isOnline: boolean;
}) => isSessionUnresolved && failureCount > 0 && !isAuthFailureError(error) && isOnline === false;

/**
 * Toast только при реальном offline (airplane / системный офлайн).
 * Proxyman и 401 не считаются потерей сети — иначе всплывашка бесит и врёт.
 */
export const useSessionRestoreNetworkToast = ({
  isSessionUnresolved,
  failureCount,
  error,
}: {
  isSessionUnresolved: boolean;
  failureCount: number;
  error: unknown;
}) => {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shouldNotify = shouldNotifySessionRestoreNetwork({
    isSessionUnresolved,
    failureCount,
    error,
    isOnline,
  });

  useEffect(() => {
    if (!shouldNotify) {
      toast.dismiss(SESSION_RESTORE_NETWORK_TOAST_ID);
      return;
    }

    const timer = window.setTimeout(() => {
      toast.warning('Нет соединения', {
        id: SESSION_RESTORE_NETWORK_TOAST_ID,
        description: 'Проверьте подключение к сети.',
        duration: 4000,
      });
    }, SESSION_RESTORE_NETWORK_TOAST_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldNotify]);
};
