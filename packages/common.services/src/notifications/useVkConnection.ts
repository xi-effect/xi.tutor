import { useCallback, useEffect, useRef, useState } from 'react';
import { useCreateVkConnection } from './useCreateVkConnection';
import { useDeleteDeliveryMethod } from './useDeleteDeliveryMethod';
import { useGetDeliveryMethods } from './useGetDeliveryMethods';
import { DeliveryMethodsResponse, VKConnectionStartResponse } from 'common.types';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90_000;

function isVkConnectedIn(data: DeliveryMethodsResponse | undefined | null) {
  return data?.vk?.delivery_method?.status === 'active';
}

export function useVkConnection() {
  const [connectionData, setConnectionData] = useState<VKConnectionStartResponse | null>(null);
  const [hasPrefetchAttempted, setHasPrefetchAttempted] = useState(false);
  const [hasUserStartedConnection, setHasUserStartedConnection] = useState(false);
  const pollStartedAtRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  const wasActiveRef = useRef(false);

  const { data, refetch, isFetched } = useGetDeliveryMethods();
  const { mutate: createConnection, isPending: isCreatePending } = useCreateVkConnection();
  const { mutate: deleteConnection, isPending: isDeletePending } = useDeleteDeliveryMethod();

  const vk = data?.vk;
  const status = vk?.delivery_method?.status;

  const isActive = status === 'active';
  const isBlocked = status === 'blocked';
  const isReplaced = status === 'replaced';
  const isNotConnected = vk === null || vk === undefined;
  const isWidgetReady = Boolean(connectionData) && !isActive;
  const isAwaitingConfirmation = isWidgetReady && hasUserStartedConnection;
  const isPending = isCreatePending || isDeletePending;

  const finishWaiting = useCallback(() => {
    setConnectionData(null);
    setHasUserStartedConnection(false);
    pollStartedAtRef.current = null;
  }, []);

  /** Сброс только ожидания — ключ/виджет оставляем, чтобы можно было нажать ещё раз */
  const cancelAwaiting = useCallback(() => {
    setHasUserStartedConnection(false);
    pollStartedAtRef.current = null;
  }, []);

  const syncDeliveryMethods = useCallback(async () => {
    const result = await refetch();

    if (isVkConnectedIn(result.data)) {
      finishWaiting();
      return true;
    }

    return false;
  }, [finishWaiting, refetch]);

  const prepareConnection = useCallback(() => {
    if (isActive || isCreatePending || connectionData) return;

    createConnection(undefined, {
      onSuccess: (response) => {
        setConnectionData(response);
      },
    });
  }, [connectionData, createConnection, isActive, isCreatePending]);

  // После успешного подключения ключ одноразовый — сразу выбрасываем
  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      if (connectionData || hasUserStartedConnection) {
        finishWaiting();
      }
    }
  }, [connectionData, finishWaiting, hasUserStartedConnection, isActive]);

  // После удаления привязки нужен новый ключ (prefetch снова)
  useEffect(() => {
    if (!wasActiveRef.current || !isNotConnected || isActive) return;

    wasActiveRef.current = false;
    finishWaiting();
    setHasPrefetchAttempted(false);
  }, [finishWaiting, isActive, isNotConnected]);

  // Ключ заранее, чтобы клик по «Подключить» сразу попал в скрытый виджет
  useEffect(() => {
    if (!isFetched || hasPrefetchAttempted || isActive || !isNotConnected) return;

    setHasPrefetchAttempted(true);
    prepareConnection();
  }, [hasPrefetchAttempted, isActive, isFetched, isNotConnected, prepareConnection]);

  // Поллим только после реального взаимодействия с виджетом VK
  useEffect(() => {
    if (!isAwaitingConfirmation) return;

    pollStartedAtRef.current = Date.now();
    isPollingRef.current = false;
    let timedOut = false;

    const poll = async () => {
      if (timedOut) return;

      if (pollStartedAtRef.current && Date.now() - pollStartedAtRef.current > POLL_TIMEOUT_MS) {
        timedOut = true;
        cancelAwaiting();
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
  }, [cancelAwaiting, isAwaitingConfirmation, syncDeliveryMethods]);

  const handleConnect = useCallback(() => {
    if (isActive || isPending) return;

    if (isBlocked || isReplaced) {
      deleteConnection('vk', {
        onSuccess: () => {
          finishWaiting();
          setHasPrefetchAttempted(false);
          wasActiveRef.current = false;
          createConnection(undefined, {
            onSuccess: (response) => {
              setHasPrefetchAttempted(true);
              setConnectionData(response);
            },
          });
        },
      });
      return;
    }

    prepareConnection();
  }, [
    createConnection,
    deleteConnection,
    finishWaiting,
    isActive,
    isBlocked,
    isPending,
    isReplaced,
    prepareConnection,
  ]);

  const handleWidgetInteraction = useCallback(() => {
    setHasUserStartedConnection(true);
  }, []);

  const resetConnection = useCallback(() => {
    finishWaiting();
  }, [finishWaiting]);

  return {
    vk,
    status,
    isActive,
    isBlocked,
    isReplaced,
    isNotConnected,
    isWidgetReady,
    isAwaitingConfirmation,
    /** @deprecated используйте isWidgetReady */
    isWaitingConfirmation: isWidgetReady,
    /** @deprecated используйте isActive */
    isConnected: isActive,
    isPending,
    connectionData,
    handleConnect,
    handleWidgetInteraction,
    prepareConnection,
    resetConnection,
    syncDeliveryMethods,
  };
}
