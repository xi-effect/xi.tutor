import type { QueryClient } from '@tanstack/react-query';
import { userStorageItemsQueryKeys } from 'common.api';
import { putCurrentUserStorageItem } from '../userStorageItems/putCurrentUserStorageItem';
import { stepsForRole, type FirstStepsRole } from './model';
import {
  createFirstStepsProgressDocument,
  firstStepsProgressStorageKey,
  readFirstStepsProgressDocument,
} from './stageDocument';
import {
  acknowledgeFirstStep,
  markDemoCabinetInitialized,
  readDemoCabinetInitialized,
  readFirstStepMarks,
  readIntroSeen,
  type FirstStepsStorage,
} from './storage';

const chains = new Map<string, Promise<void>>();

/**
 * Пишет весь прогресс роли одним документом.
 * Пока предыдущая запись в пути, следующая ждёт и отправляет уже актуальное состояние.
 */
export const saveFirstStepsProgress = (
  queryClient: QueryClient,
  storage: FirstStepsStorage,
  userId: number,
  role: FirstStepsRole,
): Promise<void> => {
  const key = firstStepsProgressStorageKey(role);
  const chainKey = `${userId}:${key}`;
  const previous = chains.get(chainKey) ?? Promise.resolve();

  const task = previous
    .catch(() => undefined)
    .then(async () => {
      const marks = readFirstStepMarks(storage, userId, role);
      const cached = queryClient.getQueryData(userStorageItemsQueryKeys.current(userId, key));
      const cachedRead = readFirstStepsProgressDocument(role, cached);
      if (cachedRead.kind === 'unknown') return;
      if (
        cachedRead.kind === 'ready' &&
        (cachedRead.intro === 'unknown' ||
          cachedRead.demoCabinetInitialized === 'unknown' ||
          stepsForRole(role).some((step) => cachedRead.stages[step] === 'unknown'))
      ) {
        return;
      }

      const ready = cachedRead.kind === 'ready' ? cachedRead : null;
      for (const step of stepsForRole(role)) {
        const remote = ready?.stages[step];
        if (marks[step] === 'pending' && (remote === 'done' || remote === 'skipped')) {
          marks[step] = remote;
        }
      }

      const introSeen = readIntroSeen(storage, userId, role) || ready?.intro === 'seen';
      const demoCabinetInitialized =
        readDemoCabinetInitialized(storage, userId, role) || ready?.demoCabinetInitialized === true;
      if (demoCabinetInitialized) markDemoCabinetInitialized(storage, userId, role);

      const document = createFirstStepsProgressDocument(
        role,
        marks,
        introSeen,
        demoCabinetInitialized,
      );

      try {
        await putCurrentUserStorageItem(key, document);
        queryClient.setQueryData(userStorageItemsQueryKeys.current(userId, key), document);

        const current = readFirstStepMarks(storage, userId, role);
        for (const step of stepsForRole(role)) {
          const status = document.steps?.[step];
          if (status && current[step] === status) {
            acknowledgeFirstStep(storage, userId, role, step);
          }
        }
      } catch (error) {
        console.error('Не удалось сохранить первые шаги', key, error);
      }
    });

  const settled = task.finally(() => {
    if (chains.get(chainKey) === settled) chains.delete(chainKey);
  });
  chains.set(chainKey, settled);
  return settled;
};
