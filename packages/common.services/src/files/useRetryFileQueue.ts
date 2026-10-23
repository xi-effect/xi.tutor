import { useRef, useCallback } from 'react';
import { useNetworkStatus } from 'common.utils';
import { nanoid } from 'nanoid';
import { DrShapeId } from '@ibodr/draw';
import { getFileUploadErrorKind } from './classifyFileUploadError';
import { uploadFileIdRequest } from './uploadFileRequest';
import { deleteFileFromDB, getAllFileKeys, getFileFromDB } from './fileStorage';

export type RetryRequest = {
  id: string;
  shapeId: DrShapeId; // он же ключ в IndexedDB
  retryCount: number;
  maxRetries: number;
  timestamp: number;
  token: string;
};

export type ProcessQueueOptions = {
  /** Файл относится к открытой доске. */
  hasShape: (shapeId: DrShapeId) => boolean;
  /** Проверка лимитов без диалогов: в фоне загрузку просто откладываем. */
  canUpload: () => boolean;
  maxBytes: () => number;
};

export type ProcessQueueResult = {
  uploaded: { fileId: string; shapeId: DrShapeId }[];
  failed: DrShapeId[];
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

  const processQueue = useCallback(
    async ({ hasShape, canUpload, maxBytes }: ProcessQueueOptions): Promise<ProcessQueueResult> => {
      const uploaded: { fileId: string; shapeId: DrShapeId }[] = [];
      const failed: DrShapeId[] = [];

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
            shapeId: key as DrShapeId,
            retryCount: 0,
            maxRetries: 5,
            token: file.token,
            timestamp: Date.now(),
          });
        }
      }

      for (const req of [...queueRef.current]) {
        // Очередь общая для всех досок: файлы других досок ждут, пока откроют их доску.
        if (!hasShape(req.shapeId)) continue;
        if (!canUpload()) break;

        const fileObject = await getFileFromDB(req.shapeId);

        if (!fileObject) {
          removeFromQueue(req.id);
          continue;
        }

        try {
          const fileId = await uploadFileIdRequest({
            file: fileObject.file,
            token: fileObject.token,
          });

          await deleteFileFromDB(req.shapeId);
          removeFromQueue(req.id);

          uploaded.push({
            fileId,
            shapeId: req.shapeId,
          });
        } catch (error) {
          const kind = getFileUploadErrorKind(error, {
            fileSize: fileObject.file.size,
            maxBytes: maxBytes(),
          });

          if (kind === 'tooLarge' || kind === 'unsupported' || kind === 'storage') {
            await deleteFileFromDB(req.shapeId);
            removeFromQueue(req.id);
            failed.push(req.shapeId);
            continue;
          }

          req.retryCount++;

          if (req.retryCount >= req.maxRetries) {
            await deleteFileFromDB(req.shapeId);
            removeFromQueue(req.id);
            failed.push(req.shapeId);
          }

          console.error(`Ошибка при повторе запроса ${req.id}:`, error);
        }
      }

      return { uploaded, failed };
    },
    [removeFromQueue],
  );

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
