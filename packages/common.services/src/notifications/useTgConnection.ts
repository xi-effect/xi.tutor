import { useCallback, useEffect, useRef, useState } from 'react';
import { useCreateTgConnection } from './useCreateTgConnection';
import { useDeleteDeliveryMethod } from './useDeleteDeliveryMethod';
import { useGetDeliveryMethods } from './useGetDeliveryMethods';
import { DeliveryMethodsResponse } from 'common.types';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120_000;

function isTgConnectedIn(data: DeliveryMethodsResponse | undefined | null) {
  return data?.telegram?.delivery_method?.status === 'active';
}

export function useTgConnection() {
  const [link, setLink] = useState<string | null>(null);
  const pollStartedAtRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);

  const { data, refetch } = useGetDeliveryMethods();
  const { mutate: createConnection, isPending: isCreatePending } = useCreateTgConnection();
  const { mutate: deleteConnection, isPending: isDeletePending } = useDeleteDeliveryMethod();

  const telegram = data?.telegram;
  const status = telegram?.delivery_method?.status;
  const isActive = status === 'active';
  const isBlocked = status === 'blocked';
  const isReplaced = status === 'replaced';
  const isNotConnected = telegram === null || telegram === undefined;
  const isAwaitingConfirmation = Boolean(link) && !isActive;
  const isPending = isCreatePending || isDeletePending;

  const finishWaiting = useCallback(() => {
    setLink(null);
    pollStartedAtRef.current = null;
  }, []);

  const syncDeliveryMethods = useCallback(async () => {
    const result = await refetch();

    if (isTgConnectedIn(result.data)) {
      finishWaiting();
      return true;
    }

    return false;
  }, [finishWaiting, refetch]);

  useEffect(() => {
    if (isActive && link) {
      finishWaiting();
    }
  }, [finishWaiting, isActive, link]);

  useEffect(() => {
    if (!isAwaitingConfirmation) return;

    pollStartedAtRef.current = Date.now();
    isPollingRef.current = false;

    const poll = async () => {
      if (pollStartedAtRef.current && Date.now() - pollStartedAtRef.current > POLL_TIMEOUT_MS) {
        return;
      }

      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        await syncDeliveryMethods();
      } finally {
        isPollingRef.current = false;
      }
    };

    void poll();

    const intervalId = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void poll();
      }
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAwaitingConfirmation, syncDeliveryMethods]);

  const openLink = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleOpenLink = useCallback(() => {
    if (!link) return;
    openLink(link);
  }, [link, openLink]);

  const handleConnect = useCallback(() => {
    if (isActive || isPending) return;

    if (link) {
      handleOpenLink();
      return;
    }

    // Открываем вкладку сразу — иначе браузер может заблокировать popup после async
    const telegramLinkTab = window.open('', '_blank');

    const connect = () => {
      createConnection(undefined, {
        onSuccess: (responseLink: string) => {
          if (!responseLink) {
            telegramLinkTab?.close();
            return;
          }

          setLink(responseLink);

          if (telegramLinkTab) {
            telegramLinkTab.location.href = responseLink;
          } else {
            openLink(responseLink);
          }
        },
        onError: () => {
          telegramLinkTab?.close();
        },
      });
    };

    if (isBlocked || isReplaced) {
      deleteConnection('telegram', {
        onSuccess: connect,
        onError: () => {
          telegramLinkTab?.close();
        },
      });
      return;
    }

    connect();
  }, [
    createConnection,
    deleteConnection,
    handleOpenLink,
    isActive,
    isBlocked,
    isPending,
    isReplaced,
    link,
    openLink,
  ]);

  return {
    telegram,
    status,
    isActive,
    isBlocked,
    isReplaced,
    isNotConnected,
    isPending,
    link,
    isAwaitingConfirmation,
    handleConnect,
    handleOpenLink,
    syncDeliveryMethods,
  };
}
