import { getFileUploadErrorKind } from 'common.services';
import { trackFileSizeLimitFromUploadError } from 'common.utils';
import i18n from 'i18next';
import { toast } from 'sonner';

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
): { title: string; description: string } | null => {
  const kind = getFileUploadErrorKind(error, { fileSize: file.size, maxBytes });
  if (kind === 'storage') return null;

  trackFileSizeLimitFromUploadError(error, file, 'board', maxBytes);
  const size = (file.size / 1024 / 1024).toFixed(2);
  const limit = Math.max(1, Math.round(maxBytes / (1024 * 1024)));

  if (kind === 'tooLarge') {
    return {
      title: tBoard('toast.fileTooLarge'),
      description: tBoard(keys.sizeDescKey, { size, limit }),
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

export const toastBoardUploadError = (
  error: unknown,
  file: File,
  maxBytes: number,
  keys: {
    sizeDescKey: string;
    failedTitleKey: string;
    failedDescKey: string;
    formatDescKey?: string;
  },
): void => {
  const content = getBoardUploadErrorToast(error, file, maxBytes, keys);
  if (!content) return;
  toast.error(content.title, { description: content.description, duration: 5000 });
};

export const isNonRetryableBoardUploadError = (
  error: unknown,
  file: File,
  maxBytes: number,
): boolean => {
  const kind = getFileUploadErrorKind(error, { fileSize: file.size, maxBytes });
  return kind === 'tooLarge' || kind === 'unsupported' || kind === 'storage';
};
