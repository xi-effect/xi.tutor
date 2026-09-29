import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { USER_FLAG_KEYS, userFlagsQueryKeys } from 'common.api';
import {
  applyUserFlagOptimisticUpdate,
  isUserFlagContentVisible,
  rollbackUserFlagUpdate,
  setUserFlagQueryData,
} from '../userFlagCache';

describe('isUserFlagContentVisible', () => {
  it('показывает UI только после успешного GET false', () => {
    expect(isUserFlagContentVisible(false, undefined)).toBe(false);
    expect(isUserFlagContentVisible(false, false)).toBe(false);
    expect(isUserFlagContentVisible(true, true)).toBe(false);
    expect(isUserFlagContentVisible(true, undefined)).toBe(false);
    expect(isUserFlagContentVisible(true, false)).toBe(true);
  });
});

describe('UserFlag query cache', () => {
  const keyA = userFlagsQueryKeys.current(1, USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED);
  const keyB = userFlagsQueryKeys.current(2, USER_FLAG_KEYS.SUBSCRIPTION_ANNOUNCEMENT_DISMISSED);
  const releaseNoteKey = userFlagsQueryKeys.current(
    1,
    USER_FLAG_KEYS.SUBSCRIPTION_RELEASE_NOTE_DISMISSED,
  );

  it('разделяет cache по userId и по ключу флага', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(keyA, true);
    queryClient.setQueryData(keyB, false);
    queryClient.setQueryData(releaseNoteKey, false);

    expect(queryClient.getQueryData(keyA)).toBe(true);
    expect(queryClient.getQueryData(keyB)).toBe(false);
    expect(queryClient.getQueryData(releaseNoteKey)).toBe(false);
  });

  it('оптимистично ставит новое значение и откатывает его при ошибке', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(keyA, false);

    const previous = await applyUserFlagOptimisticUpdate(queryClient, keyA, true);
    expect(previous).toBe(false);
    expect(queryClient.getQueryData(keyA)).toBe(true);
    expect(isUserFlagContentVisible(true, queryClient.getQueryData(keyA))).toBe(false);

    rollbackUserFlagUpdate(queryClient, keyA, previous);
    expect(queryClient.getQueryData(keyA)).toBe(false);
    expect(isUserFlagContentVisible(true, queryClient.getQueryData(keyA))).toBe(true);
  });

  it('после успешного PUT оставляет cache в состоянии ответа сервера', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(keyA, false);

    await applyUserFlagOptimisticUpdate(queryClient, keyA, true);
    setUserFlagQueryData(queryClient, keyA, true);

    expect(queryClient.getQueryData(keyA)).toBe(true);
    expect(isUserFlagContentVisible(true, true)).toBe(false);
  });

  it('при ошибке PUT, если предыдущего значения не было, не оставляет false в cache', async () => {
    const queryClient = new QueryClient();

    const previous = await applyUserFlagOptimisticUpdate(queryClient, keyA, true);
    expect(previous).toBeUndefined();

    rollbackUserFlagUpdate(queryClient, keyA, previous);

    expect(queryClient.getQueryData(keyA)).toBeUndefined();
    expect(isUserFlagContentVisible(false, undefined)).toBe(false);
  });
});
