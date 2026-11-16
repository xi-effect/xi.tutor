import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  USER_STORAGE_ITEM_VALUE_MAX_BYTES,
  userStorageItemsApiConfig,
  UserStorageItemsQueryKey,
  assertUserStorageItemKey,
  assertUserStorageItemValueSize,
  parseUserStorageItemValue,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { deleteCurrentUserStorageItem } from '../deleteCurrentUserStorageItem';
import { getCurrentUserStorageItem } from '../getCurrentUserStorageItem';
import { putCurrentUserStorageItem } from '../putCurrentUserStorageItem';

const axiosMock = vi.fn();

describe('UserStorageItem API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('строит URL GET/PUT/DELETE с key и trailing slash', () => {
    const key = 'first-step-tutor-navigation';
    const url = userStorageItemsApiConfig[UserStorageItemsQueryKey.GetCurrentItem].getUrl(key);

    expect(url).toContain(`/api/protected/user-service/users/current/storage-items/${key}/`);
    expect(url.endsWith('/')).toBe(true);
    expect(userStorageItemsApiConfig[UserStorageItemsQueryKey.UpsertCurrentItem].getUrl(key)).toBe(
      url,
    );
    expect(userStorageItemsApiConfig[UserStorageItemsQueryKey.DeleteCurrentItem].getUrl(key)).toBe(
      url,
    );
    expect(userStorageItemsApiConfig[UserStorageItemsQueryKey.GetCurrentItem].method).toBe('GET');
    expect(userStorageItemsApiConfig[UserStorageItemsQueryKey.UpsertCurrentItem].method).toBe(
      'PUT',
    );
    expect(userStorageItemsApiConfig[UserStorageItemsQueryKey.DeleteCurrentItem].method).toBe(
      'DELETE',
    );
  });

  it('GET возвращает value и считает 404 отсутствием ключа', async () => {
    axiosMock.mockResolvedValueOnce({
      status: 200,
      data: { value: { version: 'v1', status: 'done' } },
    });

    await expect(getCurrentUserStorageItem('first-step-tutor-call')).resolves.toEqual({
      version: 'v1',
      status: 'done',
    });

    axiosMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
    await expect(getCurrentUserStorageItem('first-step-tutor-call')).resolves.toBeNull();
  });

  it('PUT отправляет { value } и не пускает значение больше 64 KiB', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: { value: { version: 'v1', seen: true } } });

    await expect(
      putCurrentUserStorageItem('first-steps-tutor-intro', { version: 'v1', seen: true }),
    ).resolves.toEqual({ version: 'v1', seen: true });

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        data: { value: { version: 'v1', seen: true } },
      }),
    );

    expect(() =>
      assertUserStorageItemValueSize({ blob: 'x'.repeat(USER_STORAGE_ITEM_VALUE_MAX_BYTES) }),
    ).toThrow('User storage item value too large');
  });

  it('DELETE игнорирует уже удалённый ключ', async () => {
    axiosMock.mockResolvedValueOnce({ status: 204 });
    await expect(deleteCurrentUserStorageItem('first-step-student-join')).resolves.toBeUndefined();

    axiosMock.mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
    await expect(deleteCurrentUserStorageItem('first-step-student-join')).resolves.toBeUndefined();
    expect(axiosMock).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'DELETE' }));
  });

  it('не принимает ключ длиннее 100 символов и кривой DTO', () => {
    expect(() => assertUserStorageItemKey('')).toThrow('Invalid user storage item key');
    expect(() => assertUserStorageItemKey('k'.repeat(101))).toThrow(
      'Invalid user storage item key',
    );
    expect(() => parseUserStorageItemValue({ version: 'v1' })).toThrow(
      'Invalid UserStorageItemValueSchema',
    );
    expect(parseUserStorageItemValue({ value: { version: 'v1', status: 'done' } })).toEqual({
      version: 'v1',
      status: 'done',
    });
  });

  it('GET error не превращается в пустое значение', async () => {
    axiosMock.mockRejectedValue(new Error('network'));

    await expect(getCurrentUserStorageItem('first-step-tutor-call')).rejects.toThrow('network');
  });
});
