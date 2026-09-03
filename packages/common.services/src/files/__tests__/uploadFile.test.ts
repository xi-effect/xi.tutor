import { describe, expect, it } from 'vitest';
import { FilesQueryKey, filesApiConfig } from 'common.api';

describe('unified file upload API', () => {
  it('загружает файлы через POST /content-service/files/', () => {
    const url = filesApiConfig[FilesQueryKey.UploadFile].getUrl();

    expect(url).toContain('/api/protected/content-service/files/');
    expect(url).not.toMatch(/\/file-kinds\//);
    expect(filesApiConfig[FilesQueryKey.UploadFile].method).toBe('POST');
  });

  it('deprecated kind-specific ключи указывают на ту же унифицированную ручку', () => {
    const unified = filesApiConfig[FilesQueryKey.UploadFile].getUrl();

    expect(filesApiConfig[FilesQueryKey.UploadImage].getUrl()).toBe(unified);
    expect(filesApiConfig[FilesQueryKey.UploadAudio].getUrl()).toBe(unified);
    expect(filesApiConfig[FilesQueryKey.UploadDocument].getUrl()).toBe(unified);
    expect(filesApiConfig[FilesQueryKey.UploadPresentation].getUrl()).toBe(unified);
    expect(filesApiConfig[FilesQueryKey.UploadAttachment].getUrl()).toBe(unified);
  });
});
