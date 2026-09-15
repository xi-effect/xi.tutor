import { PRODUCT_ANALYTICS_EVENTS } from './events';
import type { ProductAnalyticsEventMap } from './eventMap';
import { getFileCategoryFromFile } from './productLimitReached';
import { trackProductEvent } from './umami';
import type {
  FileUploadFileCategory,
  FileUploadRejectReason,
  FileUploadSizeBucket,
  FileUploadSource,
} from './types';

const MB = 1024 * 1024;

export type FileUploadErrorKind = 'tooLarge' | 'unsupported' | 'failed';

export type FileUploadErrorContext = {
  fileSize?: number;
  maxBytes?: number;
};

export type FileUploadAttemptInput = {
  type?: string;
  name?: string;
  size: number;
};

export type FileUploadAttempt = {
  succeed: () => void;
  reject: (reason: FileUploadRejectReason) => void;
};

type FileUploadBaseProps = {
  event_version: 1;
  source: FileUploadSource;
  file_category: FileUploadFileCategory;
  size_bucket: FileUploadSizeBucket;
};

export const getFileUploadSizeBucket = (bytes: number): FileUploadSizeBucket => {
  if (bytes <= 1 * MB) return '0_1mb';
  if (bytes <= 5 * MB) return '1_5mb';
  if (bytes <= 30 * MB) return '5_30mb';
  return '30mb_plus';
};

const readPositiveStatus = (value: unknown): number | undefined =>
  typeof value === 'number' && value > 0 ? value : undefined;

export const getFileUploadHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const candidate = error as {
    response?: { status?: unknown };
    request?: { status?: unknown };
    status?: unknown;
  };

  return (
    readPositiveStatus(candidate.response?.status) ??
    readPositiveStatus(candidate.request?.status) ??
    readPositiveStatus(candidate.status)
  );
};

const collectErrorText = (error: unknown): string => {
  const parts: string[] = [];

  if (error instanceof Error && error.message) {
    parts.push(error.message);
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      message?: unknown;
      response?: { data?: unknown };
    };

    if (typeof candidate.message === 'string') {
      parts.push(candidate.message);
    }

    const data = candidate.response?.data;
    if (typeof data === 'string') {
      parts.push(data);
    } else if (typeof data === 'object' && data !== null) {
      const detail = (data as { detail?: unknown; message?: unknown }).detail;
      const message = (data as { detail?: unknown; message?: unknown }).message;
      if (typeof detail === 'string') parts.push(detail);
      if (typeof message === 'string') parts.push(message);
    }
  }

  return parts.join(' ').toLowerCase();
};

const isAbortLikeUploadError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown; name?: unknown; message?: unknown };
  return (
    candidate.code === 'ERR_CANCELED' ||
    candidate.name === 'AbortError' ||
    candidate.name === 'CanceledError' ||
    candidate.message === 'canceled'
  );
};

const isNetworkLikeUploadError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown };
  if (candidate.code === 'ERR_NETWORK' || candidate.code === 'ERR_BAD_RESPONSE') {
    return true;
  }

  return candidate.message === 'Network Error';
};

const isKnownTooLargeText = (text: string): boolean =>
  text.includes('413') ||
  text.includes('payload too large') ||
  text.includes('entity too large') ||
  text.includes('file too large') ||
  text.includes('слишком больш');

const isKnownUnsupportedText = (text: string): boolean =>
  text.includes('415') ||
  text.includes('422') ||
  text.includes('unsupported') ||
  text.includes('неподдерживаем');

export const getFileUploadErrorKind = (
  error: unknown,
  options?: FileUploadErrorContext,
): FileUploadErrorKind => {
  const status = getFileUploadHttpStatus(error);

  if (status === 413) {
    return 'tooLarge';
  }

  if (status === 415 || status === 422) {
    return 'unsupported';
  }

  const text = collectErrorText(error);
  if (isKnownTooLargeText(text)) {
    return 'tooLarge';
  }

  if (isKnownUnsupportedText(text)) {
    return 'unsupported';
  }

  const { fileSize, maxBytes } = options ?? {};
  if (!isNetworkLikeUploadError(error) || typeof fileSize !== 'number') {
    return 'failed';
  }

  if (typeof maxBytes === 'number' && maxBytes > 0 && fileSize >= maxBytes) {
    return 'tooLarge';
  }

  return 'failed';
};

export const getFileUploadRejectReasonFromError = (
  error: unknown,
  options?: FileUploadErrorContext,
): FileUploadRejectReason => {
  if (isAbortLikeUploadError(error)) return 'unknown';

  const kind = getFileUploadErrorKind(error, options);
  if (kind === 'tooLarge') return 'file_too_large';
  if (kind === 'unsupported') return 'unsupported_type';
  return 'upload_error';
};

export const getFileUploadRejectReasonFromEvaluation = (
  result: { ok: true } | { ok: false; reason: 'storage' | 'size' },
): FileUploadRejectReason | null => {
  if (result.ok) return null;
  return result.reason === 'size' ? 'file_too_large' : 'unknown';
};

const sanitizeFileName = (name?: string): string => {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'unknown';
  const base = trimmed.replace(/\\/g, '/').split('/').pop() ?? trimmed;
  return base.slice(0, 255);
};

const buildBaseProps = (
  source: FileUploadSource,
  file: FileUploadAttemptInput,
): FileUploadBaseProps => ({
  event_version: 1,
  source,
  file_category: getFileCategoryFromFile(file),
  size_bucket: getFileUploadSizeBucket(file.size),
});

export const beginFileUploadAttempt = (
  source: FileUploadSource,
  file: FileUploadAttemptInput,
): FileUploadAttempt => {
  const props = buildBaseProps(source, file);

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_ATTEMPTED, props);

  let settled = false;

  return {
    succeed: () => {
      if (settled) return;
      settled = true;
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_SUCCEEDED, props);
    },
    reject: (reason: FileUploadRejectReason) => {
      if (settled) return;
      settled = true;
      const payload: ProductAnalyticsEventMap['file_upload_rejected'] =
        reason === 'file_too_large'
          ? {
              event_version: props.event_version,
              source: props.source,
              file_category: props.file_category,
              reason,
              file_name: sanitizeFileName(file.name),
              file_size: file.size,
            }
          : {
              ...props,
              reason,
            };
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_REJECTED, payload);
    },
  };
};

export const rejectFileUploadFromEvaluation = (
  attempt: FileUploadAttempt,
  result: { ok: true } | { ok: false; reason: 'storage' | 'size' },
): boolean => {
  const reason = getFileUploadRejectReasonFromEvaluation(result);
  if (!reason) return false;
  attempt.reject(reason);
  return true;
};

export const rejectFileUploadFromError = (
  attempt: FileUploadAttempt,
  error: unknown,
  options?: FileUploadErrorContext,
): void => {
  attempt.reject(getFileUploadRejectReasonFromError(error, options));
};
