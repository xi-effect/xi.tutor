import type { QueryClient } from '@tanstack/react-query';
import { userStorageItemsQueryKeys } from 'common.api';
import { queryClient as appQueryClient } from 'common.config';
import {
  browserFirstStepsStorage,
  markDemoCabinetInitialized,
  readDemoCabinetInitialized,
  type FirstStepsStorage,
} from '../firstSteps/storage';
import { saveFirstStepsProgress } from '../firstSteps/syncStage';
import {
  firstStepsProgressStorageKey,
  readFirstStepsProgressDocument,
} from '../firstSteps/stageDocument';
import { getCurrentUserStorageItem } from '../userStorageItems/getCurrentUserStorageItem';

const TUTOR = 'tutor' as const;

const readProgressValue = async (userId: number, client: QueryClient): Promise<unknown> => {
  const key = firstStepsProgressStorageKey(TUTOR);
  const queryKey = userStorageItemsQueryKeys.current(userId, key);
  const state = client.getQueryState(queryKey);
  if (state?.status === 'success') return state.data;

  return client.fetchQuery({
    queryKey,
    queryFn: () => getCurrentUserStorageItem(key),
  });
};

/**
 * Признак лежит в `first-steps-tutor` как `demoCabinetInitialized`.
 * Непонятный документ не перезаписываем и новый кабинет не создаём.
 */
export const loadDemoCabinetInitialized = async (
  userId: number,
  storage: FirstStepsStorage = browserFirstStepsStorage(),
  client: QueryClient = appQueryClient,
): Promise<boolean> => {
  const value = await readProgressValue(userId, client);
  const read = readFirstStepsProgressDocument(TUTOR, value);

  if (
    read.kind === 'unknown' ||
    (read.kind === 'ready' && read.demoCabinetInitialized === 'unknown')
  ) {
    return true;
  }

  if (read.kind === 'ready' && read.demoCabinetInitialized === true) {
    markDemoCabinetInitialized(storage, userId, TUTOR);
    return true;
  }

  if (readDemoCabinetInitialized(storage, userId, TUTOR)) {
    await saveFirstStepsProgress(client, storage, userId, TUTOR);
    return true;
  }

  return false;
};

export const persistDemoCabinetInitialized = async (
  userId: number,
  storage: FirstStepsStorage = browserFirstStepsStorage(),
  client: QueryClient = appQueryClient,
): Promise<void> => {
  markDemoCabinetInitialized(storage, userId, TUTOR);
  await saveFirstStepsProgress(client, storage, userId, TUTOR);
};
