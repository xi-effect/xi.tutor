import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileKind, LibraryFile } from 'common.api';
import {
  LibraryFilesQueryKey,
  insertLibraryFileInSearchCache,
  isFileNameTooLong,
  showSuccess,
  uploadLibraryFileRequest,
} from 'common.services';
import { useQueryClient } from '@tanstack/react-query';
import {
  LIBRARY_UPLOAD_MAX_FILES,
  getBrowserFileKind,
  getLibraryUploadErrorKind,
  getLibraryUploadMaxBytes,
  type LibraryUploadErrorKind,
} from './libraryUpload';

export type LibraryUploadItem = {
  id: string;
  file: File;
  kind: FileKind;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  errorKind?: LibraryUploadErrorKind;
  libraryFile?: LibraryFile;
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

export const useLibraryFileUploads = (open: boolean) => {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<LibraryUploadItem[]>([]);
  const itemsRef = useRef(items);
  const abortRef = useRef(new Map<string, AbortController>());

  itemsRef.current = items;

  const abort = useCallback((id: string) => {
    abortRef.current.get(id)?.abort();
    abortRef.current.delete(id);
  }, []);

  const abortAll = useCallback(() => {
    abortRef.current.forEach((controller) => controller.abort());
    abortRef.current.clear();
  }, []);

  const start = useCallback(
    async (id: string, file: File) => {
      const controller = new AbortController();
      abortRef.current.set(id, controller);

      try {
        const uploaded = await uploadLibraryFileRequest({
          file,
          signal: controller.signal,
          onUploadProgress: (percent) => {
            setItems((current) =>
              current.map((item) =>
                item.id === id && item.status === 'uploading'
                  ? { ...item, progress: percent }
                  : item,
              ),
            );
          },
        });

        abortRef.current.delete(id);
        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  kind: uploaded.kind,
                  progress: 100,
                  status: 'done',
                  libraryFile: uploaded,
                }
              : item,
          ),
        );
        insertLibraryFileInSearchCache(queryClient, uploaded);
        queryClient.invalidateQueries({
          queryKey: [LibraryFilesQueryKey.SearchLibraryFiles],
        });
        showSuccess('files');
      } catch (error) {
        abortRef.current.delete(id);
        if (controller.signal.aborted) {
          return;
        }

        setItems((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: 'error',
                  errorKind: getLibraryUploadErrorKind(error, {
                    fileSize: file.size,
                    maxBytes: getLibraryUploadMaxBytes(getBrowserFileKind(file)),
                  }),
                }
              : item,
          ),
        );
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (open) {
      return;
    }

    abortAll();
    setItems([]);
  }, [abortAll, open]);

  useEffect(() => () => abortAll(), [abortAll]);

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
        nextItems.forEach((item) => {
          void start(item.id, item.file);
        });
      }

      return result;
    },
    [start],
  );

  const removeItem = useCallback(
    (id: string) => {
      abort(id);
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [abort],
  );

  const cancelAll = useCallback(() => {
    abortAll();
    setItems([]);
  }, [abortAll]);

  const cancelUploading = useCallback(() => {
    const uploadingIds = itemsRef.current
      .filter((item) => item.status === 'uploading')
      .map((item) => item.id);

    uploadingIds.forEach(abort);
    setItems((current) => current.filter((item) => item.status !== 'uploading'));
  }, [abort]);

  return {
    items,
    addFiles,
    removeItem,
    cancelAll,
    cancelUploading,
  };
};
