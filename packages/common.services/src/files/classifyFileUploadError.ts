export type FileUploadErrorKind = 'tooLarge' | 'unsupported' | 'failed';

const NETWORK_TOO_LARGE_MIN_BYTES = 1 * 1024 * 1024;

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

export const getFileUploadErrorKind = (
  error: unknown,
  options?: { fileSize?: number; maxBytes?: number },
): FileUploadErrorKind => {
  const status = getFileUploadHttpStatus(error);

  if (status === 413) {
    return 'tooLarge';
  }

  if (status === 415 || status === 422) {
    return 'unsupported';
  }

  if (error instanceof Error) {
    if (error.message.includes('413')) {
      return 'tooLarge';
    }

    if (error.message.includes('415') || error.message.includes('422')) {
      return 'unsupported';
    }
  }

  const { fileSize, maxBytes } = options ?? {};
  if (!isNetworkLikeUploadError(error) || typeof fileSize !== 'number') {
    return 'failed';
  }

  if (typeof maxBytes === 'number' && maxBytes > 0 && fileSize >= maxBytes * 0.75) {
    return 'tooLarge';
  }

  if (fileSize >= NETWORK_TOO_LARGE_MIN_BYTES) {
    return 'tooLarge';
  }

  return 'failed';
};
