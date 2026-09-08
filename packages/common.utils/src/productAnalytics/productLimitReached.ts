import { PRODUCT_ANALYTICS_EVENTS } from './events';
import type { ProductAnalyticsEventMap } from './eventMap';
import { trackProductEvent } from './umami';
import type {
  ProductLimitFileCategory,
  ProductLimitObjectKind,
  ProductLimitSizeBucket,
  ProductLimitSource,
} from './types';

const MB = 1024 * 1024;
const DEDUPE_WINDOW_MS = 400;

const IMAGE_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'avif',
  'heic',
  'heif',
  'tif',
  'tiff',
  'ico',
]);

const DOCUMENT_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'odt',
  'rtf',
  'txt',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'csv',
  'odp',
  'ods',
]);

type ProductLimitReachedProps = ProductAnalyticsEventMap['product_limit_reached'];

const recentKeys = new Map<string, number>();

const buildDedupeKey = (properties: ProductLimitReachedProps): string =>
  [
    properties.limit_type,
    properties.source,
    properties.file_category ?? '',
    properties.size_bucket ?? '',
    properties.object_kind ?? '',
    properties.blocked_on ?? '',
  ].join('|');

export const getFileSizeBucket = (bytes: number): ProductLimitSizeBucket => {
  if (bytes <= 5 * MB) return '0_5mb';
  if (bytes <= 30 * MB) return '5_30mb';
  return '30mb_plus';
};

export const getFileCategoryFromFile = (file: {
  type?: string;
  name?: string;
}): ProductLimitFileCategory => {
  const mime = (file.type ?? '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';

  const name = (file.name ?? '').toLowerCase();
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : '';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';

  if (
    DOCUMENT_EXTENSIONS.has(ext) ||
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('document') ||
    mime.includes('presentation') ||
    mime.includes('spreadsheet') ||
    mime.startsWith('text/')
  ) {
    return 'document';
  }

  return 'other';
};

const isHttpPayloadTooLarge = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return error instanceof Error && error.message.includes('413');
  }

  const candidate = error as {
    response?: { status?: unknown };
    request?: { status?: unknown };
    status?: unknown;
    message?: unknown;
  };

  if (
    candidate.response?.status === 413 ||
    candidate.request?.status === 413 ||
    candidate.status === 413
  ) {
    return true;
  }

  return typeof candidate.message === 'string' && candidate.message.includes('413');
};

export const trackProductLimitReached = (properties: ProductLimitReachedProps): boolean => {
  const payload: ProductLimitReachedProps = {
    event_version: 1,
    ...properties,
  };

  const key = buildDedupeKey(payload);
  const now = Date.now();
  const last = recentKeys.get(key);
  if (last !== undefined && now - last < DEDUPE_WINDOW_MS) {
    return false;
  }

  recentKeys.set(key, now);
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.PRODUCT_LIMIT_REACHED, payload);
  return true;
};

export const trackFileSizeLimitReached = (
  source: ProductLimitSource,
  file: { type?: string; name?: string; size: number },
  blockedOn: 'client' | 'api',
): boolean =>
  trackProductLimitReached({
    limit_type: 'file_size',
    source,
    file_category: getFileCategoryFromFile(file),
    size_bucket: getFileSizeBucket(file.size),
    blocked_on: blockedOn,
  });

export const trackFileSizeLimitFromUploadError = (
  error: unknown,
  file: { type?: string; name?: string; size: number },
  source: ProductLimitSource,
): boolean => {
  if (!isHttpPayloadTooLarge(error)) return false;
  return trackFileSizeLimitReached(source, file, 'api');
};

export const trackBoardObjectsLimitReached = (
  objectKind: ProductLimitObjectKind,
  source: ProductLimitSource = 'board',
): boolean =>
  trackProductLimitReached({
    limit_type: 'board_objects',
    source,
    object_kind: objectKind,
    blocked_on: 'client',
  });

export const trackUploadEvaluationLimit = (
  result: { ok: true } | { ok: false; reason: 'storage' | 'size' },
  file: { type?: string; name?: string; size: number },
  source: ProductLimitSource,
): boolean => {
  if (result.ok) return false;
  if (result.reason === 'storage') {
    return trackProductLimitReached({
      limit_type: 'storage',
      source,
      blocked_on: 'client',
    });
  }
  return trackFileSizeLimitReached(source, file, 'client');
};

export const trackClassroomLimitReached = (source: ProductLimitSource = 'other'): boolean =>
  trackProductLimitReached({
    limit_type: 'classrooms',
    source,
    blocked_on: 'client',
  });

export const resetProductLimitReachedDedupe = (): void => {
  recentKeys.clear();
};
