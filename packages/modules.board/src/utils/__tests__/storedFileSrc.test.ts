import { describe, expect, it } from 'vitest';
import { extractFileIdFromUrl } from '../resolveAssetUrl';
import { isDisplayableAssetUrl, normalizeStoredFileSrc } from '../storedFileSrc';

describe('normalizeStoredFileSrc', () => {
  it('оставляет пустую строку, data: и blob:', () => {
    expect(normalizeStoredFileSrc('')).toBe('');
    expect(normalizeStoredFileSrc('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    expect(normalizeStoredFileSrc('blob:https://app.local/1')).toBe('blob:https://app.local/1');
  });

  it('достаёт id из legacy storage URL', () => {
    const id = '11111111-2222-3333-4444-555555555555';
    expect(normalizeStoredFileSrc(`https://api.sovlium.ru/storage-service/v2/files/${id}/`)).toBe(
      id,
    );
  });

  it('достаёт id из content-service URL', () => {
    const id = '11111111-2222-3333-4444-555555555555';
    expect(normalizeStoredFileSrc(`https://api.sovlium.ru/content-service/files/${id}/`)).toBe(id);
  });

  it('оставляет уже нормализованный UUID', () => {
    expect(normalizeStoredFileSrc('abc-file-id')).toBe('abc-file-id');
  });
});

describe('isDisplayableAssetUrl', () => {
  it('принимает blob/data/http и отвергает file id', () => {
    expect(isDisplayableAssetUrl('blob:https://app.local/1')).toBe(true);
    expect(isDisplayableAssetUrl('data:image/png;base64,abc')).toBe(true);
    expect(isDisplayableAssetUrl('https://cdn.example/img.png')).toBe(true);
    expect(isDisplayableAssetUrl('11111111-2222-3333-4444-555555555555')).toBe(false);
    expect(isDisplayableAssetUrl('')).toBe(false);
    expect(isDisplayableAssetUrl(null)).toBe(false);
  });
});

describe('extractFileIdFromUrl', () => {
  it('возвращает null для не-URL', () => {
    expect(extractFileIdFromUrl('plain-id')).toBeNull();
    expect(extractFileIdFromUrl('data:image/png;base64,x')).toBeNull();
  });

  it('парсит storage-service URL', () => {
    expect(extractFileIdFromUrl('https://cdn.example/storage-service/v2/files/file-42/')).toBe(
      'file-42',
    );
  });

  it('парсит content-service URL', () => {
    expect(extractFileIdFromUrl('https://cdn.example/content-service/files/file-42/')).toBe(
      'file-42',
    );
  });
});
