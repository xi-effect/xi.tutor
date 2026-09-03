import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filesApiConfig, FilesQueryKey } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { attachFileToYDocRequest } from '../useAttachFileToYDoc';

const axiosMock = vi.fn();

const vars = {
  ydocId: '22222222-2222-4222-8222-222222222222',
  fileId: '11111111-1111-4111-8111-111111111111',
  token: 'content-token',
};

function httpError(status: number, detail?: string) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, data: { detail } },
    isAxiosError: true,
  });
}

describe('attachFileToYDoc', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('отправляет PUT с X-Content-Token на ydocs/{ydocId}/files/{fileId}', async () => {
    axiosMock.mockResolvedValue({ status: 204, data: '' });

    await expect(attachFileToYDocRequest(vars)).resolves.toBeUndefined();

    const call = axiosMock.mock.calls[0][0];
    expect(call.method).toBe('PUT');
    expect(call.url).toBe(
      filesApiConfig[FilesQueryKey.AttachFileToYDoc].getUrl(vars.ydocId, vars.fileId),
    );
    expect(call.url).toContain(`/ydocs/${vars.ydocId}/files/${vars.fileId}/`);
    expect(call.headers).toEqual({
      'Content-Type': 'application/json',
      'x-content-token': vars.token,
    });
  });

  it('считает 204 успехом и падает на другом статусе', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: {} });

    await expect(attachFileToYDocRequest(vars)).rejects.toThrow('Attach file to YDoc failed: 200');
  });

  it.each([
    [401, 'Unauthorized'],
    [403, 'File access denied'],
    [404, 'YDoc not found'],
  ])('пробрасывает ошибку %s', async (status, detail) => {
    axiosMock.mockRejectedValue(httpError(status, detail));

    await expect(attachFileToYDocRequest(vars)).rejects.toMatchObject({
      response: { status, data: { detail } },
    });
  });
});
