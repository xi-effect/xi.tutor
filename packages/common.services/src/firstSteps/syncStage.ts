import type { QueryClient } from '@tanstack/react-query';
import { userStorageItemsQueryKeys } from 'common.api';
import { putCurrentUserStorageItem } from '../userStorageItems/putCurrentUserStorageItem';
import type { FirstStepId, FirstStepsRole } from './model';
import {
  createFirstStepStageDocument,
  createFirstStepsIntroDocument,
  FIRST_STEPS_INTRO_STORAGE_KEYS,
  firstStepStageStorageKey,
} from './stageDocument';
import { acknowledgeFirstStep, readFirstStepMarks, type FirstStepsStorage } from './storage';

const inflight = new Map<string, Promise<void>>();
const latestToken = new Map<string, number>();
let tokenSeq = 0;

const rememberFlight = (flightKey: string, task: Promise<void>): Promise<void> => {
  inflight.set(flightKey, task);
  return task.finally(() => {
    if (inflight.get(flightKey) === task) inflight.delete(flightKey);
  });
};

/** Пишет отметку этапа. Повтор того же статуса, пока запрос в пути, не шлёт второй PUT. */
export const saveFirstStepStage = (
  queryClient: QueryClient,
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
  step: FirstStepId,
  status: 'done' | 'skipped',
): Promise<void> => {
  const key = firstStepStageStorageKey(role, step);
  const flightKey = `${userId}:${key}:${status}`;
  const existing = inflight.get(flightKey);
  if (existing) return existing;

  const stageKey = `${userId}:${key}`;
  const token = ++tokenSeq;
  latestToken.set(stageKey, token);
  const document = createFirstStepStageDocument(status);

  const task = (async () => {
    try {
      await putCurrentUserStorageItem(key, document);
      if (latestToken.get(stageKey) !== token) return;

      queryClient.setQueryData(userStorageItemsQueryKeys.current(userId, key), document);
      if (readFirstStepMarks(storage, userId, role)[step] === status) {
        acknowledgeFirstStep(storage, userId, role, step);
      }
    } catch (error) {
      console.error('Не удалось сохранить этап первых шагов', key, error);
    }
  })();

  return rememberFlight(flightKey, task);
};

export const saveFirstStepsIntro = (
  queryClient: QueryClient,
  userId: number,
  role: FirstStepsRole,
): Promise<void> => {
  const key = FIRST_STEPS_INTRO_STORAGE_KEYS[role];
  const flightKey = `${userId}:${key}`;
  const existing = inflight.get(flightKey);
  if (existing) return existing;

  const document = createFirstStepsIntroDocument();
  const task = (async () => {
    try {
      await putCurrentUserStorageItem(key, document);
      queryClient.setQueryData(userStorageItemsQueryKeys.current(userId, key), document);
    } catch (error) {
      console.error('Не удалось сохранить приветствие первых шагов', key, error);
    }
  })();

  return rememberFlight(flightKey, task);
};
