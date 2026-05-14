import { useRef, useCallback } from 'react';
import { useNetworkStatus } from '../../../common.utils/src/NetworkContext';

import { uploadFileRequest, deleteFileFromDB, getFileFromDB } from 'common.services';
import { TLShapeId } from 'tldraw';

export type RetryRequest = {
  id: string;
  shapeId: TLShapeId;
  fileKey: string; // ключ в IndexedDB
  retryCount: number;
  maxRetries: number;
  timestamp: number;
  token: string;
};

export const useRetryFileQueue = () => {
  const queueRef = useRef<RetryRequest[]>([]);
  const { isOnline } = useNetworkStatus();

  const addToQueue = useCallback((request: Omit<RetryRequest, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const retryRequest: RetryRequest = {
      ...request,
      id,
      timestamp: Date.now(),
    };

    queueRef.current.push(retryRequest);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    queueRef.current = queueRef.current.filter((req) => req.id !== id);
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline) return [];

    const results: { fileId: string; shapeId: TLShapeId }[] = [];

    for (const req of [...queueRef.current]) {
      try {
        const file = await getFileFromDB(req.fileKey);

        if (!file) {
          removeFromQueue(req.id);
          continue;
        }

        const fileId = await uploadFileRequest({
          file,
          token: req.token,
        });

        await deleteFileFromDB(req.fileKey);
        removeFromQueue(req.id);

        results.push({
          fileId,
          shapeId: req.shapeId,
        });
      } catch (error) {
        req.retryCount++;

        if (req.retryCount >= req.maxRetries) {
          removeFromQueue(req.id);
        }

        console.error(`Ошибка при повторе запроса ${req.id}:`, error);
      }
    }

    return results;
  }, [isOnline, removeFromQueue]);

  const clearQueue = useCallback(() => {
    queueRef.current = [];
  }, []);

  const getQueueLength = useCallback(() => {
    return queueRef.current.length;
  }, []);

  return {
    addToQueue,
    removeFromQueue,
    processQueue,
    clearQueue,
    getQueueLength,
    isOnline,
  };
};
