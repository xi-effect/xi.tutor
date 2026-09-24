import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCT_ANALYTICS_EVENTS } from '../events';
import {
  beginFileUploadAttempt,
  getFileUploadRejectReasonFromError,
  getFileUploadSizeBucket,
  rejectFileUploadFromEvaluation,
} from '../fileUpload';

vi.mock('../umami', () => ({
  trackProductEvent: vi.fn(),
}));

import { trackProductEvent } from '../umami';

const trackMock = vi.mocked(trackProductEvent);
const MB = 1024 * 1024;

afterEach(() => {
  trackMock.mockClear();
});

describe('getFileUploadSizeBucket', () => {
  it('кладёт размер только в безопасные корзины из ТЗ', () => {
    expect(getFileUploadSizeBucket(0)).toBe('0_1mb');
    expect(getFileUploadSizeBucket(MB)).toBe('0_1mb');
    expect(getFileUploadSizeBucket(MB + 1)).toBe('1_2mb');
    expect(getFileUploadSizeBucket(2 * MB)).toBe('1_2mb');
    expect(getFileUploadSizeBucket(2 * MB + 1)).toBe('2_5mb');
    expect(getFileUploadSizeBucket(5 * MB)).toBe('2_5mb');
    expect(getFileUploadSizeBucket(5 * MB + 1)).toBe('5_10mb');
    expect(getFileUploadSizeBucket(10 * MB)).toBe('5_10mb');
    expect(getFileUploadSizeBucket(10 * MB + 1)).toBe('10_20mb');
    expect(getFileUploadSizeBucket(20 * MB)).toBe('10_20mb');
    expect(getFileUploadSizeBucket(20 * MB + 1)).toBe('20_30mb');
    expect(getFileUploadSizeBucket(30 * MB)).toBe('20_30mb');
    expect(getFileUploadSizeBucket(30 * MB + 1)).toBe('30_50mb');
    expect(getFileUploadSizeBucket(50 * MB)).toBe('30_50mb');
    expect(getFileUploadSizeBucket(50 * MB + 1)).toBe('50_100mb');
    expect(getFileUploadSizeBucket(100 * MB)).toBe('50_100mb');
    expect(getFileUploadSizeBucket(100 * MB + 1)).toBe('100mb_plus');
  });
});

describe('getFileUploadRejectReasonFromError', () => {
  it('мапит 413 в file_too_large без сырого сообщения', () => {
    expect(getFileUploadRejectReasonFromError({ response: { status: 413 } })).toBe(
      'file_too_large',
    );
  });

  it('мапит 415/422 в unsupported_type', () => {
    expect(getFileUploadRejectReasonFromError({ response: { status: 415 } })).toBe(
      'unsupported_type',
    );
    expect(getFileUploadRejectReasonFromError({ status: 422 })).toBe('unsupported_type');
  });

  it('мапит backend detail о размере без сырого текста в payload', () => {
    expect(
      getFileUploadRejectReasonFromError({
        response: { status: 400, data: { detail: 'Request Entity Too Large' } },
      }),
    ).toBe('file_too_large');
  });

  it('не считает Network Error превышением лимита без контекста размера', () => {
    expect(
      getFileUploadRejectReasonFromError({ code: 'ERR_NETWORK', message: 'Network Error' }),
    ).toBe('upload_error');
  });

  it('считает Network Error превышением, если файл больше текущего лимита', () => {
    expect(
      getFileUploadRejectReasonFromError(
        { code: 'ERR_NETWORK', message: 'Network Error' },
        { fileSize: 8 * MB, maxBytes: 5 * MB },
      ),
    ).toBe('file_too_large');
  });
});

describe('beginFileUploadAttempt', () => {
  it('для oversized-файла даёт attempted → rejected file_too_large с bucket и степенью превышения', () => {
    const file = { type: 'application/pdf', name: 'secret.pdf', size: 8 * MB };
    const attempt = beginFileUploadAttempt('materials', file, { maxBytes: 5 * MB });

    attempt.reject('file_too_large');
    attempt.reject('file_too_large');
    attempt.succeed();

    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(trackMock).toHaveBeenNthCalledWith(1, PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_ATTEMPTED, {
      event_version: 1,
      source: 'materials',
      file_category: 'document',
      size_bucket: '5_10mb',
    });
    expect(trackMock).toHaveBeenNthCalledWith(2, PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_REJECTED, {
      event_version: 1,
      source: 'materials',
      file_category: 'document',
      size_bucket: '5_10mb',
      reason: 'file_too_large',
      limit_exceeded_by: '50_100_percent',
    });
  });

  it('для успешной загрузки даёт attempted → succeeded и игнорирует повторный progress', () => {
    const file = { type: 'image/png', name: 'photo.png', size: 500_000 };
    const attempt = beginFileUploadAttempt('board', file);

    attempt.succeed();
    attempt.succeed();

    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(trackMock).toHaveBeenNthCalledWith(2, PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_SUCCEEDED, {
      event_version: 1,
      source: 'board',
      file_category: 'image',
      size_bucket: '0_1mb',
    });
  });

  it('мапит client size evaluation в file_too_large относительно реального лимита', () => {
    const attempt = beginFileUploadAttempt('classroom', {
      type: 'image/jpeg',
      name: 'a.jpg',
      size: 2 * MB,
    });

    expect(
      rejectFileUploadFromEvaluation(attempt, {
        ok: false,
        reason: 'size',
        maxBytes: MB,
      }),
    ).toBe(true);

    expect(trackMock).toHaveBeenLastCalledWith(PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_REJECTED, {
      event_version: 1,
      source: 'classroom',
      file_category: 'image',
      size_bucket: '1_2mb',
      reason: 'file_too_large',
      limit_exceeded_by: '50_100_percent',
    });
  });

  it('для остальных отказов оставляет size_bucket без имени файла', () => {
    const attempt = beginFileUploadAttempt('board', {
      type: 'application/zip',
      name: 'archive.zip',
      size: 200_000,
    });

    attempt.reject('unsupported_type');

    expect(trackMock).toHaveBeenLastCalledWith(PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_REJECTED, {
      event_version: 1,
      source: 'board',
      file_category: 'other',
      size_bucket: '0_1mb',
      reason: 'unsupported_type',
    });
  });
});
