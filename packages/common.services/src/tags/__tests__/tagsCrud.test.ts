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

  it('создаёт generic-тег POST с name и color', async () => {
    axiosMock.mockResolvedValue({
      status: 201,
      data: { id: 1, name: 'ЕГЭ', color: 'blue' },
    });

    await expect(
      createTagRequest({ kind: TAG_KIND.Generic, name: 'ЕГЭ', color: 'blue' }),
    ).resolves.toEqual({
      id: 1,
      name: 'ЕГЭ',
      color: 'blue',
    });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: { name: 'ЕГЭ', color: 'blue' },
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toBe(
      tagsApiConfig[TagsQueryKey.CreateTag].getUrl(TAG_KIND.Generic),
    );
  });

  it('меняет имя и цвет тега PATCH', async () => {
    axiosMock.mockResolvedValue({
      status: 200,
      data: { id: 1, name: 'ЕГЭ 2027', color: 'orange' },
    });

    await expect(
      updateTagRequest({ kind: TAG_KIND.Generic, id: 1, name: 'ЕГЭ 2027', color: 'orange' }),
    ).resolves.toEqual({ id: 1, name: 'ЕГЭ 2027', color: 'orange' });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PATCH',
        data: { name: 'ЕГЭ 2027', color: 'orange' },
      }),
    );
  });

  it('удаляет тег DELETE', async () => {
    axiosMock.mockResolvedValue({ status: 204, data: '' });

    await expect(deleteTagRequest({ kind: TAG_KIND.Generic, id: 1 })).resolves.toBeUndefined();
    expect(axiosMock.mock.calls[0][0].method).toBe('DELETE');
  });
});
