import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileKind } from 'common.api';
import { isFileNameTooLong } from 'common.services';
import {
  LIBRARY_UPLOAD_MAX_FILES,
  getBrowserFileKind,
  getLibraryUploadMaxBytes,
} from './libraryUpload';

export type LibraryUploadItem = {
  id: string;
  file: File;
  kind: FileKind;
  progress: number;
  status: 'uploading' | 'done';
};

export type AddLibraryUploadFilesResult = {
  added: number;
  rejectedTooLarge: string[];
  rejectedTooLong: string[];
  rejectedLimit: number;
};

const createItemId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useSimulatedLibraryUploads = (open: boolean) => {
  const [items, setItems] = useState<LibraryUploadItem[]>([]);
  const itemsRef = useRef(items);
  const framesRef = useRef<Map<string, number>>(new Map());

  itemsRef.current = items;

  const stop = useCallback((id: string) => {
    const frame = framesRef.current.get(id);
    if (frame == null) {
      return;
    }

    cancelAnimationFrame(frame);
    framesRef.current.delete(id);
  }, []);

  const stopAll = useCallback(() => {
    framesRef.current.forEach((frame) => cancelAnimationFrame(frame));
    framesRef.current.clear();
  }, []);

  const start = useCallback((id: string) => {
    const duration = 1800 + Math.random() * 2200;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                progress,
                status: progress >= 100 ? 'done' : 'uploading',
              }
            : item,
        ),
      );

      if (progress < 100) {
        framesRef.current.set(id, requestAnimationFrame(tick));
        return;
      }

      framesRef.current.delete(id);
    };

    framesRef.current.set(id, requestAnimationFrame(tick));
  }, []);

  useEffect(() => {
    if (open) {
      return;
    }

    stopAll();
    setItems([]);
  }, [open, stopAll]);

  useEffect(() => () => stopAll(), [stopAll]);

  const addFiles = useCallback(
    (files: File[]): AddLibraryUploadFilesResult => {
      const remaining = LIBRARY_UPLOAD_MAX_FILES - itemsRef.current.length;
      const nextItems: LibraryUploadItem[] = [];
      const result: AddLibraryUploadFilesResult = {
        added: 0,
        rejectedTooLarge: [],
        rejectedTooLong: [],
        rejectedLimit: 0,
      };

      files.forEach((file) => {
        if (nextItems.length >= remaining) {
          result.rejectedLimit += 1;
          return;
        }

        if (isFileNameTooLong(file.name)) {
          result.rejectedTooLong.push(file.name);
          return;
        }

        const kind = getBrowserFileKind(file);
        if (file.size > getLibraryUploadMaxBytes(kind)) {
          result.rejectedTooLarge.push(file.name);
          return;
        }

        nextItems.push({
          id: createItemId(),
          file,
          kind,
          progress: 0,
          status: 'uploading',
        });
      });

      result.added = nextItems.length;

      if (nextItems.length > 0) {
        setItems((current) => [...current, ...nextItems]);
        nextItems.forEach((item) => start(item.id));
      }

      return result;
    },
    [start],
  );

  const removeItem = useCallback(
    (id: string) => {
      stop(id);
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [stop],
  );

  const cancelAll = useCallback(() => {
    stopAll();
    setItems([]);
  }, [stopAll]);

  return {
    items,
    addFiles,
    removeItem,
    cancelAll,
  };
};
