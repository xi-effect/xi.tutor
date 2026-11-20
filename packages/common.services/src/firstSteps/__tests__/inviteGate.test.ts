import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../userFlags/updateCurrentUserFlag', () => ({
  updateCurrentUserFlag: vi.fn(async () => false),
}));

import { updateCurrentUserFlag } from '../../userFlags/updateCurrentUserFlag';
import { resetInviteDoneImportForTests, resolveInviteDoneImport } from '../inviteGate';
import { readFirstStepMarks, type FirstStepsStorage } from '../storage';

const memoryStorage = (): FirstStepsStorage => {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe('устаревшая отметка приглашения', () => {
  const local = new Map<string, string>();

  beforeEach(() => {
    local.clear();
    resetInviteDoneImportForTests();
    vi.mocked(updateCurrentUserFlag).mockClear();
    vi.stubGlobal('window', {
      dispatchEvent: () => true,
      localStorage: {
        getItem: (key: string) => local.get(key) ?? null,
        setItem: (key: string, value: string) => {
          local.set(key, value);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('в первый заход стирает локальное выполнение и не доверяет флагу', async () => {
    const storage = memoryStorage();
    storage.setItem(
      'sovlium.firstSteps.v1.9.tutor',
      JSON.stringify({ marks: { invite: 'done' }, dirty: ['invite'], introSeen: false }),
    );

    await expect(resolveInviteDoneImport(storage, 9, 'tutor')).resolves.toBe(false);
    expect(readFirstStepMarks(storage, 9, 'tutor').invite).toBe('pending');
    expect(updateCurrentUserFlag).toHaveBeenCalledWith('fs.tutor.invite.done', false);
    await expect(resolveInviteDoneImport(storage, 9, 'tutor')).resolves.toBe(false);
  });

  it('после отсечки снова доверяет уже записанному флагу', async () => {
    local.set('sovlium.firstSteps.inviteMarkedByTour.9', '1');

    await expect(resolveInviteDoneImport(memoryStorage(), 9, 'tutor')).resolves.toBe(true);
    expect(updateCurrentUserFlag).not.toHaveBeenCalled();
  });
});
