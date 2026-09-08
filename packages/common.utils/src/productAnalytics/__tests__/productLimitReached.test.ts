import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import {
  getFileCategoryFromFile,
  getFileSizeBucket,
  resetProductLimitReachedDedupe,
  trackFileSizeLimitFromUploadError,
  trackProductLimitReached,
} from '../productLimitReached';

vi.mock('../umami', () => ({
  trackProductEvent: vi.fn(),
}));

import { trackProductEvent } from '../umami';

const trackMock = vi.mocked(trackProductEvent);

afterEach(() => {
  resetProductLimitReachedDedupe();
  trackMock.mockClear();
});

describe('getFileSizeBucket', () => {
  it('кладёт точный размер в безопасные корзины без исходных байт', () => {
    expect(getFileSizeBucket(0)).toBe('0_5mb');
    expect(getFileSizeBucket(5 * 1024 * 1024)).toBe('0_5mb');
    expect(getFileSizeBucket(5 * 1024 * 1024 + 1)).toBe('5_30mb');
    expect(getFileSizeBucket(30 * 1024 * 1024)).toBe('5_30mb');
    expect(getFileSizeBucket(30 * 1024 * 1024 + 1)).toBe('30mb_plus');
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
      size_bucket: '5_30mb' as const,
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
    const file = { type: 'application/pdf', name: 'a.pdf', size: 8 * 1024 * 1024 };

    expect(trackFileSizeLimitFromUploadError({ code: 'ERR_NETWORK' }, file, 'board')).toBe(false);
    expect(trackFileSizeLimitFromUploadError({ response: { status: 413 } }, file, 'board')).toBe(
      true,
    );
    expect(trackMock).toHaveBeenCalledTimes(1);
  });
});
