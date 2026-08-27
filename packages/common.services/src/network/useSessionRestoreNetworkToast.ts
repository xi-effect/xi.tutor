import { useEffect } from 'react';
import { toast } from 'sonner';
import { isAuthFailureError } from '../user/authCheckError';

export const SESSION_RESTORE_NETWORK_TOAST_ID = 'session-restore-network';
export const SESSION_RESTORE_NETWORK_TOAST_DELAY_MS = 2000;

export const shouldNotifySessionRestoreNetwork = ({
  isSessionUnresolved,
  failureCount,
  error,
}: {
  isSessionUnresolved: boolean;
  failureCount: number;
  error: unknown;
}) => isSessionUnresolved && failureCount > 0 && !isAuthFailureError(error);

/**
 * Один спокойный toast, если проверка сессии упирается в сеть.
 * Появляется с задержкой, чтобы короткий обрыв (1–2 с) не вспыхивал всплывашкой.
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
  const shouldNotify = shouldNotifySessionRestoreNetwork({
    isSessionUnresolved,
    failureCount,
    error,
  });

  useEffect(() => {
    if (!shouldNotify) {
      toast.dismiss(SESSION_RESTORE_NETWORK_TOAST_ID);
      return;
    }

    const timer = window.setTimeout(() => {
      toast.warning('Нет соединения', {
        id: SESSION_RESTORE_NETWORK_TOAST_ID,
        description: 'Страница откроется, когда появится сеть.',
        duration: 6000,
      });
    }, SESSION_RESTORE_NETWORK_TOAST_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldNotify]);
};
