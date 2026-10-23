import { beforeEach, describe, expect, it, vi } from 'vitest';

const getQueryData = vi.fn();
const invalidateQueries = vi.fn();

vi.mock('common.config', () => ({
  queryClient: {
    getQueryData: (...args: unknown[]) => getQueryData(...args),
    invalidateQueries: (...args: unknown[]) => invalidateQueries(...args),
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

vi.mock('i18next', () => ({
  default: { t: (key: string) => key },
}));

vi.mock('common.utils', async () => {
  const actual = await vi.importActual<typeof import('common.utils')>('common.utils');
  return {
    ...actual,
    trackProductLimitReached: vi.fn(),
  };
});

import { toast } from 'sonner';
import { trackProductLimitReached } from 'common.utils';
import {
  preventStorageWrite,
  reportStorageLimitReached,
  setStorageWriteGuard,
  setTutorStorageLimitHandler,
} from '../storageLimitReached';

const storageError = () => ({
  response: { status: 409, data: { detail: 'Storage limit reached' } },
});

describe('reportStorageLimitReached', () => {
  beforeEach(() => {
    getQueryData.mockReset();
    invalidateQueries.mockReset();
    vi.mocked(toast.error).mockReset();
    vi.mocked(trackProductLimitReached).mockReset();
    setTutorStorageLimitHandler(null);
    setStorageWriteGuard(null);
  });

  it('игнорирует другие 409', () => {
    expect(
      reportStorageLimitReached({
        response: { status: 409, data: { detail: 'Classroom is read-only' } },
      }),
    ).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('ученику пишет, что место закончилось у репетитора', () => {
    getQueryData.mockReturnValue({ default_layout: 'student' });

    expect(reportStorageLimitReached(storageError())).toBe(true);
    expect(toast.error).toHaveBeenCalledWith('toast.storageLimit.student');
    expect(trackProductLimitReached).toHaveBeenCalledWith({
      limit_type: 'storage',
      source: 'other',
      blocked_on: 'api',
    });
  });

  it('репетитору открывает диалог лимита и не дублирует его', () => {
    getQueryData.mockReturnValue({ default_layout: 'tutor' });
    const openDialog = vi.fn();
    setTutorStorageLimitHandler(openDialog);

    const error = storageError();
    expect(reportStorageLimitReached(error)).toBe(true);
    expect(reportStorageLimitReached(error)).toBe(true);
    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('не отправляет запрос, если по текущему тарифу место уже кончилось', () => {
    const guard = vi.fn(() => true);
    setStorageWriteGuard(guard);

    expect(() => preventStorageWrite()).toThrow(/Storage write blocked/);
    expect(guard).toHaveBeenCalledOnce();
    expect(trackProductLimitReached).toHaveBeenCalledWith({
      limit_type: 'storage',
      source: 'other',
      blocked_on: 'client',
    });
  });
});
