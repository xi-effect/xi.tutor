import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationsQueryKey } from 'common.api';
import { useCreateVkConnection } from './useCreateVkConnection';
import { useDeleteDeliveryMethod } from './useDeleteDeliveryMethod';
import { useGetDeliveryMethods } from './useGetDeliveryMethods';
import { DeliveryMethodsResponse, VKConnectionStartResponse } from 'common.types';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 90_000;

function isVkConnectedIn(data: DeliveryMethodsResponse | undefined | null) {
  return data?.vk?.delivery_method?.status === 'active';
}

export function useVkConnection() {
  const queryClient = useQueryClient();
  const [connectionData, setConnectionData] = useState<VKConnectionStartResponse | null>(null);
  const [hasPrefetchAttempted, setHasPrefetchAttempted] = useState(false);
  const [hasUserStartedConnection, setHasUserStartedConnection] = useState(false);

  const pollStartedAtRef = useRef<number | null>(null);
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
  const isWidgetReady = Boolean(connectionData) && !isActive;
  const isAwaitingConfirmation = isWidgetReady && hasUserStartedConnection;
  const isPending = isCreatePending || isDeletePending;

  const finishWaiting = useCallback(() => {
    setConnectionData(null);
    setHasUserStartedConnection(false);
    pollStartedAtRef.current = null;
  }, []);

  const rotateKey = useCallback(() => {
    setConnectionData(null);
    setHasUserStartedConnection(false);
    pollStartedAtRef.current = null;
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

  useEffect(() => {
    if (!wasActiveRef.current || !isNotConnected || isActive) return;

    wasActiveRef.current = false;
    rotateKey();
  }, [isActive, isNotConnected, rotateKey]);

  useEffect(() => {
    if (!isFetched || hasPrefetchAttempted || isActive || !isNotConnected) return;

    setHasPrefetchAttempted(true);
    prepareConnection();
  }, [hasPrefetchAttempted, isActive, isFetched, isNotConnected, prepareConnection]);

  // Поллинг статуса, пока ждём подтверждение
  useEffect(() => {
    if (!isAwaitingConfirmation) return;

    if (!pollStartedAtRef.current) {
      pollStartedAtRef.current = Date.now();
    }

    isPollingRef.current = false;

    const poll = async () => {
      if (pollStartedAtRef.current && Date.now() - pollStartedAtRef.current > POLL_TIMEOUT_MS) {
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

    void poll();

    const intervalId = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      void poll();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void poll();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAwaitingConfirmation, rotateKey, syncDeliveryMethods]);

  const handleConnect = useCallback(() => {
    if (isActive || isPending) return;

    if (isBlocked || isReplaced) {
      deleteConnection('vk', {
        onSuccess: () => {
          wasActiveRef.current = false;
          rotateKey();
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
    isActive,
    isBlocked,
    isPending,
    isReplaced,
    prepareConnection,
    rotateKey,
  ]);

  const handleWidgetInteraction = useCallback(() => {
    if (!pollStartedAtRef.current) {
      pollStartedAtRef.current = Date.now();
    }
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
