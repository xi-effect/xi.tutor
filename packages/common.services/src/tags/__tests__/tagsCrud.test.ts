import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TAG_KIND, TagsQueryKey, tagsApiConfig } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { createTagRequest } from '../useCreateTag';
import { updateTagRequest } from '../useUpdateTag';
import { deleteTagRequest } from '../useDeleteTag';

const axiosMock = vi.fn();

describe('tags CRUD', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('создаёт generic-тег POST с name', async () => {
    axiosMock.mockResolvedValue({ status: 201, data: { id: 1, name: 'ЕГЭ' } });

    await expect(createTagRequest({ kind: TAG_KIND.Generic, name: 'ЕГЭ' })).resolves.toEqual({
      id: 1,
      name: 'ЕГЭ',
    });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: { name: 'ЕГЭ' },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toBe(
      tagsApiConfig[TagsQueryKey.CreateTag].getUrl(TAG_KIND.Generic),
    );
  });

  it('переименовывает тег PATCH', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: { id: 1, name: 'ЕГЭ 2027' } });

    await expect(
      updateTagRequest({ kind: TAG_KIND.Generic, id: 1, name: 'ЕГЭ 2027' }),
    ).resolves.toEqual({ id: 1, name: 'ЕГЭ 2027' });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        data: { name: 'ЕГЭ 2027' },
      }),
    );
  });

  it('удаляет тег DELETE', async () => {
    axiosMock.mockResolvedValue({ status: 204, data: '' });

    await expect(deleteTagRequest({ kind: TAG_KIND.Generic, id: 1 })).resolves.toBeUndefined();
    expect(axiosMock.mock.calls[0][0].method).toBe('DELETE');
  });
});
