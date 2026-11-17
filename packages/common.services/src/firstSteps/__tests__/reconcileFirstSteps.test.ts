import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QueryClient } from '@tanstack/react-query';

vi.mock('../../userStorageItems/putCurrentUserStorageItem', () => ({
  putCurrentUserStorageItem: vi.fn(async (_key: string, value: unknown) => value),
}));

vi.mock('../../userFlags/getCurrentUserFlag', () => ({
  getCurrentUserFlag: vi.fn(async () => false),
}));

import { getCurrentUserFlag } from '../../userFlags/getCurrentUserFlag';
import { putCurrentUserStorageItem } from '../../userStorageItems/putCurrentUserStorageItem';
import { reconcileFirstSteps } from '../reconcileFirstSteps';
import { readFirstStepMarks, readIntroSeen, type FirstStepsStorage } from '../storage';
import type { RemoteStage } from '../stageDocument';

const memoryStorage = (): FirstStepsStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

const queryClient = {
  setQueryData: vi.fn(),
} as unknown as QueryClient;

const missingTutor = (): Record<string, RemoteStage> => ({
  navigation: 'missing',
  cabinet: 'missing',
  call: 'missing',
  invite: 'missing',
  material: 'missing',
});

describe('перенос первых шагов в storage item', () => {
  beforeEach(() => {
    vi.mocked(putCurrentUserStorageItem).mockClear();
    vi.mocked(getCurrentUserFlag).mockReset();
    vi.mocked(getCurrentUserFlag).mockResolvedValue(false);
  });

  it('записывает локальную отметку, если на сервере этапа ещё нет', async () => {
    const storage = memoryStorage();
    storage.setItem(
      'sovlium.firstSteps.v1.4.tutor',
      JSON.stringify({ marks: { navigation: 'done' }, dirty: [], introSeen: false }),
    );

    await reconcileFirstSteps({
      storage,
      userId: 4,
      role: 'tutor',
      remoteStages: missingTutor(),
      remoteIntro: 'missing',
      ignoreInviteDone: false,
      queryClient,
    });

    expect(putCurrentUserStorageItem).toHaveBeenCalledWith('first-step-tutor-navigation', {
      version: 'v1',
      status: 'done',
    });
    expect(readFirstStepMarks(storage, 4, 'tutor').navigation).toBe('done');
  });

  it('берёт серверный статус и не перезаписывает его', async () => {
    const storage = memoryStorage();

    await reconcileFirstSteps({
      storage,
      userId: 4,
      role: 'tutor',
      remoteStages: { ...missingTutor(), cabinet: 'skipped' },
      remoteIntro: 'seen',
      ignoreInviteDone: false,
      queryClient,
    });

    expect(readFirstStepMarks(storage, 4, 'tutor').cabinet).toBe('skipped');
    expect(readIntroSeen(storage, 4, 'tutor')).toBe(true);
    expect(putCurrentUserStorageItem).not.toHaveBeenCalled();
  });

  it('переносит старый флаг и пропускает ложное приглашение', async () => {
    vi.mocked(getCurrentUserFlag).mockImplementation(async (key: string) => {
      return key === 'fs.tutor.navigation.done' || key === 'fs.tutor.invite.done';
    });
    const storage = memoryStorage();

    await reconcileFirstSteps({
      storage,
      userId: 4,
      role: 'tutor',
      remoteStages: missingTutor(),
      remoteIntro: 'missing',
      ignoreInviteDone: true,
      queryClient,
    });

    expect(readFirstStepMarks(storage, 4, 'tutor').navigation).toBe('done');
    expect(readFirstStepMarks(storage, 4, 'tutor').invite).toBe('pending');
    expect(putCurrentUserStorageItem).toHaveBeenCalledWith('first-step-tutor-navigation', {
      version: 'v1',
      status: 'done',
    });
    expect(putCurrentUserStorageItem).not.toHaveBeenCalledWith(
      'first-step-tutor-invite',
      expect.anything(),
    );
  });

  it('не затирает документ неизвестной версии', async () => {
    const storage = memoryStorage();
    storage.setItem(
      'sovlium.firstSteps.v1.4.tutor',
      JSON.stringify({ marks: { call: 'done' }, dirty: ['call'], introSeen: true }),
    );

    await reconcileFirstSteps({
      storage,
      userId: 4,
      role: 'tutor',
      remoteStages: { ...missingTutor(), call: 'unknown' },
      remoteIntro: 'unknown',
      ignoreInviteDone: false,
      queryClient,
    });

    expect(readFirstStepMarks(storage, 4, 'tutor').call).toBe('done');
    expect(putCurrentUserStorageItem).not.toHaveBeenCalled();
  });
});
