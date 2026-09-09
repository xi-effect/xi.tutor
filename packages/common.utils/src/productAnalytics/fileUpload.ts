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

const readHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const candidate = error as {
    response?: { status?: unknown };
    request?: { status?: unknown };
    status?: unknown;
  };

  for (const value of [candidate.response?.status, candidate.request?.status, candidate.status]) {
    if (typeof value === 'number' && value > 0) return value;
  }

  return undefined;
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

export const getFileUploadRejectReasonFromError = (error: unknown): FileUploadRejectReason => {
  if (isAbortLikeUploadError(error)) return 'unknown';

  const status = readHttpStatus(error);
  if (status === 413) return 'file_too_large';
  if (status === 415 || status === 422) return 'unsupported_type';

  if (error instanceof Error) {
    if (error.message.includes('413')) return 'file_too_large';
    if (error.message.includes('415') || error.message.includes('422')) return 'unsupported_type';
  }

  return 'upload_error';
};

export const getFileUploadRejectReasonFromEvaluation = (
  result: { ok: true } | { ok: false; reason: 'storage' | 'size' },
): FileUploadRejectReason | null => {
  if (result.ok) return null;
  return result.reason === 'size' ? 'file_too_large' : 'unknown';
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
      const payload: ProductAnalyticsEventMap['file_upload_rejected'] = {
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

export const rejectFileUploadFromError = (attempt: FileUploadAttempt, error: unknown): void => {
  attempt.reject(getFileUploadRejectReasonFromError(error));
};
