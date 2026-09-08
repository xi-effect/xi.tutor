import { useCallback, useEffect, useRef, useState } from 'react';
import type { FileKind, LibraryFile } from 'common.api';
import {
  LibraryFilesQueryKey,
  insertClassroomFileInSearchCache,
  insertLibraryFileInSearchCache,
  invalidateClassroomFiles,
  isFileNameTooLong,
  showSuccess,
  uploadClassroomFileRequest,
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
import { getFileTooLargeMessage } from 'features.subscription';
import {
  isStorageQuotaReached,
  requestStorageLimitDialog,
  tryStartUpload,
} from 'common.subscription';
import {
  trackFileSizeLimitFromUploadError,
  trackProductLimitReached,
  trackUploadEvaluationLimit,
} from 'common.utils';

export type LibraryUploadItem = {
  id: string;
  file: File;
  kind: FileKind;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  errorKind?: LibraryUploadErrorKind;
  errorMessage?: string;
  libraryFile?: LibraryFile;
};

export type AddLibraryUploadFilesResult = {
  added: number;
  rejectedTooLarge: string[];
  rejectedTooLong: string[];
  rejectedLimit: number;
  rejectedStorage: number;
};

const createItemId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useLibraryFileUploads = (open: boolean, classroomId?: string) => {
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
        const onUploadProgress = (percent: number) => {
          setItems((current) =>
            current.map((item) =>
              item.id === id && item.status === 'uploading' ? { ...item, progress: percent } : item,
            ),
          );
        };

        const uploaded = classroomId
          ? await uploadClassroomFileRequest({
              classroomId,
              file,
              signal: controller.signal,
              onUploadProgress,
            })
          : await uploadLibraryFileRequest({
              file,
              signal: controller.signal,
              onUploadProgress,
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
        if (classroomId) {
          insertClassroomFileInSearchCache(queryClient, classroomId, uploaded);
          invalidateClassroomFiles(queryClient, classroomId);
        }
        showSuccess('files');
      } catch (error) {
        abortRef.current.delete(id);
        if (controller.signal.aborted) {
          return;
        }

        trackFileSizeLimitFromUploadError(error, file, classroomId ? 'classroom' : 'materials');

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
    [classroomId, queryClient],
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
        rejectedStorage: 0,
      };

      const source = classroomId ? 'classroom' : 'materials';

      if (isStorageQuotaReached()) {
        requestStorageLimitDialog();
        trackProductLimitReached({
          limit_type: 'storage',
          source,
          blocked_on: 'client',
        });
        result.rejectedStorage = files.length;
        return result;
      }

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
        const uploadKind = kind === 'image' ? 'image' : 'other';
        const evaluation = tryStartUpload(file, uploadKind);
        if (!evaluation.ok) {
          trackUploadEvaluationLimit(evaluation, file, source);
        }

        if (!evaluation.ok && evaluation.reason === 'storage') {
          result.rejectedStorage += 1;
          return;
        }

        if (!evaluation.ok && evaluation.reason === 'size') {
          nextItems.push({
            id: createItemId(),
            file,
            kind,
            progress: 0,
            status: 'error',
            errorKind: 'tooLarge',
            errorMessage: getFileTooLargeMessage(
              evaluation.planId,
              evaluation.kind,
              evaluation.maxBytes,
            ),
          });
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

      result.added = nextItems.filter((item) => item.status === 'uploading').length;

      if (nextItems.length > 0) {
        setItems((current) => [...current, ...nextItems]);
        nextItems.forEach((item) => {
          if (item.status === 'uploading') {
            void start(item.id, item.file);
          }
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
