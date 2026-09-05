import { describe, expect, it } from 'vitest';
import { getFileUploadErrorKind } from '../classifyFileUploadError';

describe('getFileUploadErrorKind', () => {
  it('считает 413 слишком большим файлом', () => {
    expect(getFileUploadErrorKind({ response: { status: 413 } })).toBe('tooLarge');
  });

  it('считает axios-сообщение со статусом 413 слишком большим файлом', () => {
    expect(getFileUploadErrorKind(new Error('Request failed with status code 413'))).toBe(
      'tooLarge',
    );
  });

  it('считает CORS/Network Error у крупного файла слишком большим', () => {
    expect(
      getFileUploadErrorKind(
        { code: 'ERR_NETWORK', message: 'Network Error' },
        { fileSize: 5 * 1024 * 1024, maxBytes: 5 * 1024 * 1024 },
      ),
    ).toBe('tooLarge');
  });

  it('не маскирует мелкий файл с Network Error под лимит размера', () => {
    expect(
      getFileUploadErrorKind(
        { code: 'ERR_NETWORK', message: 'Network Error' },
        { fileSize: 20 * 1024, maxBytes: 5 * 1024 * 1024 },
      ),
    ).toBe('failed');
  });

  it('считает 415 и 422 неподдерживаемым форматом', () => {
    expect(getFileUploadErrorKind({ response: { status: 415 } })).toBe('unsupported');
    expect(getFileUploadErrorKind({ response: { status: 422 } })).toBe('unsupported');
    expect(getFileUploadErrorKind(new Error('Request failed with status code 422'))).toBe(
      'unsupported',
    );
  });
});
