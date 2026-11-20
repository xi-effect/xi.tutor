import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../userStorageItems/getCurrentUserStorageItem', () => ({
  getCurrentUserStorageItem: vi.fn(async () => null),
}));

vi.mock('../../userStorageItems/putCurrentUserStorageItem', () => ({
  putCurrentUserStorageItem: vi.fn(async (_key: string, value: unknown) => value),
}));

import { getCurrentUserStorageItem } from '../../userStorageItems/getCurrentUserStorageItem';
import { putCurrentUserStorageItem } from '../../userStorageItems/putCurrentUserStorageItem';
import type { FirstStepsStorage } from '../../firstSteps/storage';
import { loadDemoCabinetInitialized, persistDemoCabinetInitialized } from '../initialized';

const memoryStorage = (): FirstStepsStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe('признак демонстрационного кабинета', () => {
  beforeEach(() => {
    vi.mocked(getCurrentUserStorageItem).mockReset();
    vi.mocked(getCurrentUserStorageItem).mockResolvedValue(null);
    vi.mocked(putCurrentUserStorageItem).mockClear();
  });

  it('берёт признак из документа первых шагов', async () => {
    vi.mocked(getCurrentUserStorageItem).mockResolvedValue({
      version: 'v1',
      demoCabinetInitialized: true,
    });
    const client = new QueryClient();

    await expect(loadDemoCabinetInitialized(4, memoryStorage(), client)).resolves.toBe(true);
    expect(putCurrentUserStorageItem).not.toHaveBeenCalled();
  });

  it('пустой документ считает кабинет несозданным', async () => {
    const client = new QueryClient();

    await expect(loadDemoCabinetInitialized(4, memoryStorage(), client)).resolves.toBe(false);
    expect(getCurrentUserStorageItem).toHaveBeenCalledWith('first-steps-tutor');
    expect(putCurrentUserStorageItem).not.toHaveBeenCalled();
  });

  it('запись кабинета дополняет уже загруженный документ', async () => {
    const client = new QueryClient();
    client.setQueryData(['GetCurrentUserStorageItem', 4, 'first-steps-tutor'], {
      version: 'v1',
      introSeen: true,
      steps: { navigation: 'done' },
    });

    await persistDemoCabinetInitialized(4, memoryStorage(), client);

    expect(putCurrentUserStorageItem).toHaveBeenCalledWith('first-steps-tutor', {
      version: 'v1',
      introSeen: true,
      demoCabinetInitialized: true,
      steps: { navigation: 'done' },
    });
  });
});
