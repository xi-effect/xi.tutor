import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilesQueryKey, filesApiConfig } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { uploadFileRequest } from '../uploadFileRequest';

const axiosMock = vi.fn();

const uploaded = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'photo',
  extension: 'webp',
  kind: 'image' as const,
  content_type: 'image/webp',
  size_bytes: 12,
  created_at: '2026-01-01T00:00:00Z',
};

describe('content file upload API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('загружает через POST /content-service/files/ (generic upload)', () => {
    const url = filesApiConfig[FilesQueryKey.UploadFile].getUrl();

    expect(url).toContain('/api/protected/content-service/files/');
    expect(url).not.toMatch(/\/file-kinds\//);
    expect(filesApiConfig[FilesQueryKey.UploadImage].getUrl()).toBe(url);
    expect(filesApiConfig[FilesQueryKey.UploadDocument].getUrl()).toBe(url);
    expect(filesApiConfig[FilesQueryKey.UploadPresentation].getUrl()).toBe(url);
  });

  it('не ставит multipart Content-Type вручную и нормализует пустой MIME png', async () => {
    axiosMock.mockResolvedValue({ status: 201, data: uploaded });
    const file = new File(['png-bytes'], 'photo.png', { type: '' });

    await expect(uploadFileRequest({ file, token: 'tok' })).resolves.toEqual(uploaded);

    const call = axiosMock.mock.calls[0][0];
    expect(call.url).toMatch(/\/content-service\/files\/$/);
    expect(call.headers).toEqual({ 'x-content-token': 'tok' });
    expect(call.headers['Content-Type']).toBeUndefined();
    expect((call.data.get('upload') as File).type).toBe('image/png');
  });

  it('ставит application/pdf для pdf с пустым type', async () => {
    axiosMock.mockResolvedValue({
      status: 201,
      data: { ...uploaded, kind: 'document', extension: 'pdf' },
    });

    await uploadFileRequest({
      file: new File(['%PDF'], 'notes.pdf', { type: '' }),
      token: 'tok',
    });

    expect((axiosMock.mock.calls[0][0].data.get('upload') as File).type).toBe('application/pdf');
  });

  it('ставит pptx MIME вместо octet-stream', async () => {
    axiosMock.mockResolvedValue({
      status: 201,
      data: { ...uploaded, kind: 'presentation', extension: 'pptx' },
    });

    await uploadFileRequest({
      file: new File(['PK'], 'deck.pptx', { type: 'application/octet-stream' }),
      token: 'tok',
    });

    expect((axiosMock.mock.calls[0][0].data.get('upload') as File).type).toContain(
      'presentationml.presentation',
    );
  });
});
