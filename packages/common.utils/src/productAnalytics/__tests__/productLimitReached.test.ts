import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import {
  getFileCategoryFromFile,
  getFileSizeBucket,
  getLimitExceededBy,
  resetProductLimitReachedDedupe,
  trackFileSizeLimitFromUploadError,
  trackProductLimitReached,
  trackUploadEvaluationLimit,
} from '../productLimitReached';

vi.mock('../umami', () => ({
  trackProductEvent: vi.fn(),
}));

import { trackProductEvent } from '../umami';

const trackMock = vi.mocked(trackProductEvent);
const MB = 1024 * 1024;

afterEach(() => {
  resetProductLimitReachedDedupe();
  trackMock.mockClear();
});

describe('getFileSizeBucket', () => {
  it('кладёт точный размер в безопасные корзины без исходных байт', () => {
    expect(getFileSizeBucket(0)).toBe('0_1mb');
    expect(getFileSizeBucket(5 * MB)).toBe('2_5mb');
    expect(getFileSizeBucket(5 * MB + 1)).toBe('5_10mb');
    expect(getFileSizeBucket(30 * MB)).toBe('20_30mb');
    expect(getFileSizeBucket(30 * MB + 1)).toBe('30_50mb');
    expect(getFileSizeBucket(100 * MB + 1)).toBe('100mb_plus');
  });
});

describe('getLimitExceededBy', () => {
  it('считает превышение относительно переданного лимита, не хардкодя тариф', () => {
    const limit = 5 * MB;
    expect(getLimitExceededBy(limit, limit)).toBeUndefined();
    expect(getLimitExceededBy(6 * MB, limit)).toBe('up_to_25_percent');
    expect(getLimitExceededBy(6.25 * MB, limit)).toBe('up_to_25_percent');
    expect(getLimitExceededBy(6.25 * MB + 1, limit)).toBe('25_50_percent');
    expect(getLimitExceededBy(7.5 * MB, limit)).toBe('25_50_percent');
    expect(getLimitExceededBy(7.5 * MB + 1, limit)).toBe('50_100_percent');
    expect(getLimitExceededBy(10 * MB, limit)).toBe('50_100_percent');
    expect(getLimitExceededBy(10 * MB + 1, limit)).toBe('2x_3x');
    expect(getLimitExceededBy(15 * MB, limit)).toBe('2x_3x');
    expect(getLimitExceededBy(15 * MB + 1, limit)).toBe('3x_plus');
  });
});

describe('getFileCategoryFromFile', () => {
  it('мапит mime и расширение в enum без передачи имени', () => {
    expect(getFileCategoryFromFile({ type: 'image/png', name: 'secret.png' })).toBe('image');
    expect(getFileCategoryFromFile({ type: 'application/pdf', name: 'homework.pdf' })).toBe(
      'document',
    );
    expect(getFileCategoryFromFile({ type: 'audio/mpeg', name: 'voice.mp3' })).toBe('other');
  });
});

describe('trackProductLimitReached', () => {
  it('отправляет product_limit_reached и схлопывает технический дубль в коротком окне', () => {
    const payload = {
      limit_type: 'file_size' as const,
      source: 'materials' as const,
      file_category: 'document' as const,
      size_bucket: '5_10mb' as const,
      limit_exceeded_by: '50_100_percent' as const,
      blocked_on: 'client' as const,
    };

    expect(trackProductLimitReached(payload)).toBe(true);
    expect(trackProductLimitReached(payload)).toBe(false);
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.PRODUCT_LIMIT_REACHED, {
      event_version: 1,
      ...payload,
    });
  });

  it('считает повторную попытку после окна дедупа новым событием', () => {
    vi.useFakeTimers();
    const payload = { limit_type: 'storage' as const, source: 'classroom' as const };

    trackProductLimitReached(payload);
    vi.advanceTimersByTime(400);
    trackProductLimitReached(payload);

    expect(trackMock).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('trackFileSizeLimitFromUploadError', () => {
  it('отправляет событие только на HTTP 413, не на эвристику Network Error', () => {
    const file = { type: 'application/pdf', name: 'a.pdf', size: 8 * MB };

    expect(trackFileSizeLimitFromUploadError({ code: 'ERR_NETWORK' }, file, 'board')).toBe(false);
    expect(
      trackFileSizeLimitFromUploadError({ response: { status: 413 } }, file, 'board', 5 * MB),
    ).toBe(true);
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.PRODUCT_LIMIT_REACHED, {
      event_version: 1,
      limit_type: 'file_size',
      source: 'board',
      file_category: 'document',
      size_bucket: '5_10mb',
      limit_exceeded_by: '50_100_percent',
      blocked_on: 'api',
    });
  });
});

describe('trackUploadEvaluationLimit', () => {
  it('для size берёт maxBytes из оценки загрузки', () => {
    const file = { type: 'image/png', name: 'photo.png', size: 12 * MB };

    expect(
      trackUploadEvaluationLimit({ ok: false, reason: 'size', maxBytes: 5 * MB }, file, 'board'),
    ).toBe(true);

    expect(trackMock).toHaveBeenCalledWith(PRODUCT_ANALYTICS_EVENTS.PRODUCT_LIMIT_REACHED, {
      event_version: 1,
      limit_type: 'file_size',
      source: 'board',
      file_category: 'image',
      size_bucket: '10_20mb',
      limit_exceeded_by: '2x_3x',
      blocked_on: 'client',
    });
  });
});
