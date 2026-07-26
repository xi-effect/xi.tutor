import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationsQueryKey } from 'common.api';
import { useCreateVkConnection } from './useCreateVkConnection';
import { useDeleteDeliveryMethod } from './useDeleteDeliveryMethod';
import { useGetDeliveryMethods } from './useGetDeliveryMethods';
import { DeliveryMethodsResponse, VKConnectionStartResponse } from 'common.types';

const POLL_INTERVAL_MS = 3000;
/** Ключ VK одноразовый и, вероятно, протухает — после этого времени берём новый, если ещё не active */
const KEY_ROTATE_TIMEOUT_MS = 5 * 60_000;

function isVkConnectedIn(data: DeliveryMethodsResponse | undefined | null) {
  return data?.vk?.delivery_method?.status === 'active';
}

export function useVkConnection() {
  const queryClient = useQueryClient();
  const [connectionData, setConnectionData] = useState<VKConnectionStartResponse | null>(null);
  const [hasPrefetchAttempted, setHasPrefetchAttempted] = useState(false);
  const [hasUserStartedConnection, setHasUserStartedConnection] = useState(false);

  const connectionStartedAtRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  const wasActiveRef = useRef(false);

  const { data, isFetched } = useGetDeliveryMethods();
  const { mutate: createConnection, isPending: isCreatePending } = useCreateVkConnection();
  const { mutate: deleteConnection, isPending: isDeletePending } = useDeleteDeliveryMethod();

  const vk = data?.vk;
  const status = vk?.delivery_method?.status;

  const isActive = status === 'active';
  const isBlocked = status === 'blocked';
  const isReplaced = status === 'replaced';
  const isNotConnected = vk === null || vk === undefined;
  /** Ключ получен и виджет можно показывать пользователю */
  const isWidgetReady = Boolean(connectionData) && !isActive;
  /** Косметика для текста — не влияет на то, работает ли синхронизация статуса */
  const isAwaitingConfirmation = isWidgetReady && hasUserStartedConnection;
  const isPending = isCreatePending || isDeletePending;

  const finishWaiting = useCallback(() => {
    setConnectionData(null);
    setHasUserStartedConnection(false);
    connectionStartedAtRef.current = null;
  }, []);

  const rotateKey = useCallback(() => {
    setConnectionData(null);
    setHasUserStartedConnection(false);
    connectionStartedAtRef.current = null;
    setHasPrefetchAttempted(false);
  }, []);

  const syncDeliveryMethods = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [NotificationsQueryKey.DeliveryMethods],
    });

    const fresh = queryClient.getQueryData<DeliveryMethodsResponse>([
      NotificationsQueryKey.DeliveryMethods,
    ]);

    if (isVkConnectedIn(fresh)) {
      finishWaiting();
      return true;
    }

    return false;
  }, [finishWaiting, queryClient]);

  const prepareConnection = useCallback(() => {
    if (isActive || isCreatePending || connectionData) return;

    createConnection(undefined, {
      onSuccess: (response) => {
        connectionStartedAtRef.current = Date.now();
        setConnectionData(response);
      },
    });
  }, [connectionData, createConnection, isActive, isCreatePending]);

  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      if (connectionData || hasUserStartedConnection) {
        finishWaiting();
      }
    }
  }, [connectionData, finishWaiting, hasUserStartedConnection, isActive]);

  // После удаления привязки нужен новый ключ
  useEffect(() => {
    if (!wasActiveRef.current || !isNotConnected || isActive) return;

    wasActiveRef.current = false;
    rotateKey();
  }, [isActive, isNotConnected, rotateKey]);

  // Ключ заранее, чтобы клик по «Подключить» сразу попал в готовый виджет
  useEffect(() => {
    if (!isFetched || hasPrefetchAttempted || isActive || !isNotConnected) return;

    setHasPrefetchAttempted(true);
    prepareConnection();
  }, [hasPrefetchAttempted, isActive, isFetched, isNotConnected, prepareConnection]);

  /**
   * Клик внутри iframe VK кросс-домена и не всегда даёт надёжный сигнал наружу
   * (может не открыть диалог, если пользователь уже разрешил вход в VK).
   * Поэтому статус синхронизируем сами, пока виджет показан и не active —
   * это не зависит от того, поймали ли мы момент клика.
   */
  useEffect(() => {
    if (!isWidgetReady) return;

    let stopped = false;

    const tick = async () => {
      if (stopped || document.visibilityState !== 'visible') return;

      if (
        connectionStartedAtRef.current &&
        Date.now() - connectionStartedAtRef.current > KEY_ROTATE_TIMEOUT_MS
      ) {
        rotateKey();
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

    void tick();

    const intervalId = window.setInterval(() => {
      void tick();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void tick();
    };

    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isWidgetReady, rotateKey, syncDeliveryMethods]);

  const handleConnect = useCallback(() => {
    if (isActive || isPending) return;

    if (isBlocked || isReplaced) {
      deleteConnection('vk', {
        onSuccess: () => {
          wasActiveRef.current = false;
          rotateKey();
          createConnection(undefined, {
            onSuccess: (response) => {
              connectionStartedAtRef.current = Date.now();
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
    isActive,
    isBlocked,
    isPending,
    isReplaced,
    prepareConnection,
    rotateKey,
  ]);

  /** Косметический сигнал для текста «Ожидаем…» — реальная синхронизация идёт фоновым поллингом */
  const handleWidgetInteraction = useCallback(() => {
    setHasUserStartedConnection(true);
    void syncDeliveryMethods();
  }, [syncDeliveryMethods]);

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
