import { useRef, useCallback } from 'react';
import { useNetworkStatus } from 'common.utils';
import { nanoid } from 'nanoid';

import {
  uploadFileRequest,
  deleteFileFromDB,
  getFileFromDB,
  getAllFileKeys,
} from 'common.services';
import { TLShapeId } from 'tldraw';

export type RetryRequest = {
  id: string;
  shapeId: TLShapeId; // он же ключ в IndexedDB
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
    const results: { fileId: string; shapeId: TLShapeId }[] = [];

    if (queueRef.current.length === 0) {
      const keys = await getAllFileKeys();

      for (const key of keys) {
        const file = await getFileFromDB(key);
        if (!file) {
          await deleteFileFromDB(key);
          continue;
        }

        queueRef.current.push({
          id: nanoid(),
          shapeId: key as TLShapeId,
          retryCount: 0,
          maxRetries: 5,
          token: file.token,
          timestamp: Date.now(),
        });
      }
    }

    for (const req of [...queueRef.current]) {
      try {
        const fileObject = await getFileFromDB(req.shapeId);

        if (!fileObject) {
          removeFromQueue(req.id);
          continue;
        }

        const fileId = await uploadFileRequest({
          file: fileObject.file,
          token: fileObject.token,
        });

        await deleteFileFromDB(req.shapeId);
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
  }, [removeFromQueue]);

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
