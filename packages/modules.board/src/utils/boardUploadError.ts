import { getFileUploadErrorKind } from 'common.services';
import i18n from 'i18next';

const tBoard = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, { ns: 'board', ...options });

export const getBoardUploadErrorToast = (
  error: unknown,
  file: File,
  maxBytes: number,
  keys: {
    sizeDescKey: string;
    failedTitleKey: string;
    failedDescKey: string;
    formatDescKey?: string;
  },
): { title: string; description: string } => {
  const kind = getFileUploadErrorKind(error, { fileSize: file.size, maxBytes });
  const size = (file.size / 1024 / 1024).toFixed(2);

  if (kind === 'tooLarge') {
    return {
      title: tBoard('toast.fileTooLarge'),
      description: tBoard(keys.sizeDescKey, { size }),
    };
  }

  if (kind === 'unsupported') {
    return {
      title: tBoard('toast.unsupportedFormat'),
      description: tBoard(keys.formatDescKey ?? 'toast.fileFormatDesc'),
    };
  }

  const raw = error instanceof Error ? error.message : '';
  const description = raw && raw !== 'Network Error' ? raw : tBoard(keys.failedDescKey);

  return {
    title: tBoard(keys.failedTitleKey),
    description,
  };
};

export const isNonRetryableBoardUploadError = (
  error: unknown,
  file: File,
  maxBytes: number,
): boolean => {
  const kind = getFileUploadErrorKind(error, { fileSize: file.size, maxBytes });
  return kind === 'tooLarge' || kind === 'unsupported';
};
