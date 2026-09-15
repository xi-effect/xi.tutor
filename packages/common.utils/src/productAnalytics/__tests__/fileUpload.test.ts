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

afterEach(() => {
  trackMock.mockClear();
});

describe('getFileUploadSizeBucket', () => {
  it('кладёт размер только в безопасные корзины из ТЗ', () => {
    expect(getFileUploadSizeBucket(0)).toBe('0_1mb');
    expect(getFileUploadSizeBucket(1024 * 1024)).toBe('0_1mb');
    expect(getFileUploadSizeBucket(1024 * 1024 + 1)).toBe('1_5mb');
    expect(getFileUploadSizeBucket(5 * 1024 * 1024)).toBe('1_5mb');
    expect(getFileUploadSizeBucket(5 * 1024 * 1024 + 1)).toBe('5_30mb');
    expect(getFileUploadSizeBucket(30 * 1024 * 1024)).toBe('5_30mb');
    expect(getFileUploadSizeBucket(30 * 1024 * 1024 + 1)).toBe('30mb_plus');
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
        { fileSize: 8 * 1024 * 1024, maxBytes: 5 * 1024 * 1024 },
      ),
    ).toBe('file_too_large');
  });
});

describe('beginFileUploadAttempt', () => {
  it('для oversized-файла даёт attempted → rejected file_too_large один раз', () => {
    const file = { type: 'application/pdf', name: 'secret.pdf', size: 8 * 1024 * 1024 };
    const attempt = beginFileUploadAttempt('materials', file);

    attempt.reject('file_too_large');
    attempt.reject('file_too_large');
    attempt.succeed();

    expect(trackMock).toHaveBeenCalledTimes(2);
    expect(trackMock).toHaveBeenNthCalledWith(1, PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_ATTEMPTED, {
      event_version: 1,
      source: 'materials',
      file_category: 'document',
      size_bucket: '5_30mb',
    });
    expect(trackMock).toHaveBeenNthCalledWith(2, PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_REJECTED, {
      event_version: 1,
      source: 'materials',
      file_category: 'document',
      reason: 'file_too_large',
      file_name: 'secret.pdf',
      file_size: 8 * 1024 * 1024,
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

  it('мапит client size evaluation в file_too_large', () => {
    const attempt = beginFileUploadAttempt('classroom', {
      type: 'image/jpeg',
      name: 'a.jpg',
      size: 2 * 1024 * 1024,
    });

    expect(rejectFileUploadFromEvaluation(attempt, { ok: false, reason: 'size' })).toBe(true);

    expect(trackMock).toHaveBeenLastCalledWith(PRODUCT_ANALYTICS_EVENTS.FILE_UPLOAD_REJECTED, {
      event_version: 1,
      source: 'classroom',
      file_category: 'image',
      reason: 'file_too_large',
      file_name: 'a.jpg',
      file_size: 2 * 1024 * 1024,
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
