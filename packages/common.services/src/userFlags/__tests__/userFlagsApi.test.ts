import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  USER_FLAG_KEYS,
  userFlagsApiConfig,
  UserFlagsQueryKey,
  parseUserFlagValue,
} from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import { getCurrentUserFlag } from '../getCurrentUserFlag';
import { updateCurrentUserFlag } from '../updateCurrentUserFlag';

const axiosMock = vi.fn();

describe('UserFlag API', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('строит URL GET/PUT с key и trailing slash', () => {
    const key = USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED;
    const url = userFlagsApiConfig[UserFlagsQueryKey.GetCurrentFlag].getUrl(key);

    expect(url).toContain(`/api/protected/user-service/users/current/flags/${key}/`);
    expect(url.endsWith('/')).toBe(true);
    expect(userFlagsApiConfig[UserFlagsQueryKey.UpsertCurrentFlag].getUrl(key)).toBe(url);
    expect(userFlagsApiConfig[UserFlagsQueryKey.GetCurrentFlag].method).toBe('GET');
    expect(userFlagsApiConfig[UserFlagsQueryKey.UpsertCurrentFlag].method).toBe('PUT');
  });

  it('GET нормализует UserFlagValueSchema в boolean', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: { value: false } });

    await expect(
      getCurrentUserFlag(USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED),
    ).resolves.toBe(false);

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
      }),
    );
    expect(String(axiosMock.mock.calls[0][0].url)).toContain(
      `/flags/${USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED}/`,
    );
  });

  it('PUT отправляет { value } и возвращает boolean', async () => {
    axiosMock.mockResolvedValue({ status: 200, data: { value: true } });

    await expect(
      updateCurrentUserFlag(USER_FLAG_KEYS.SUBSCRIPTION_RELEASE_NOTE_DISMISSED, true),
    ).resolves.toBe(true);

    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        data: { value: true },
      }),
    );
  });

  it('не считает голый boolean валидным DTO', () => {
    expect(() => parseUserFlagValue(false)).toThrow('Invalid UserFlagValueSchema');
    expect(() => parseUserFlagValue({ value: 'false' })).toThrow('Invalid UserFlagValueSchema');
    expect(() => parseUserFlagValue({})).toThrow('Invalid UserFlagValueSchema');
  });

  it('принимает только { value: boolean }', () => {
    expect(parseUserFlagValue({ value: true })).toBe(true);
    expect(parseUserFlagValue({ value: false })).toBe(false);
  });

  it('GET error не превращается в false', async () => {
    axiosMock.mockRejectedValue(new Error('network'));

    await expect(
      getCurrentUserFlag(USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED),
    ).rejects.toThrow('network');
  });
});
