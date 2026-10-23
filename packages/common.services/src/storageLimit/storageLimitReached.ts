import { SubscriptionQueryKey, UserQueryKey } from 'common.api';
import { queryClient } from 'common.config';
import {
  isStorageLimitReachedError,
  StorageWriteBlockedError,
  trackProductLimitReached,
} from 'common.utils';
import i18n from 'i18next';
import { toast } from 'sonner';

const HANDLED = Symbol.for('xi.storageLimitReached');
const STUDENT_TOAST_WINDOW_MS = 2000;
const STORAGE_USAGE_REFRESH_DELAY_MS = 400;

type HandledError = {
  [HANDLED]?: boolean;
};

type HomeUser = {
  default_layout?: string;
};

let tutorStorageLimitHandler: (() => void) | null = null;
let storageWriteGuard: (() => boolean) | null = null;
let lastStudentToastAt = 0;
let storageUsageRefreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Перезапрашивает занятое место после загрузки или удаления. Серия вызовов схлопывается в один запрос. */
export const invalidateStorageUsage = () => {
  if (storageUsageRefreshTimer) clearTimeout(storageUsageRefreshTimer);
  storageUsageRefreshTimer = setTimeout(() => {
    storageUsageRefreshTimer = null;
    void queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.StorageUsage] });
  }, STORAGE_USAGE_REFRESH_DELAY_MS);
};

export const setStorageWriteGuard = (guard: (() => boolean) | null) => {
  storageWriteGuard = guard;
};

/** Не даёт репетитору начать запись, если по текущему тарифу хранилище уже заполнено. */
export const preventStorageWrite = (): void => {
  if (!storageWriteGuard?.()) return;

  trackProductLimitReached({
    limit_type: 'storage',
    source: 'other',
    blocked_on: 'client',
  });
  throw new StorageWriteBlockedError();
};

export const setTutorStorageLimitHandler = (handler: (() => void) | null) => {
  tutorStorageLimitHandler = handler;
};

const isStudent = (): boolean => {
  const user = queryClient.getQueryData<HomeUser>([UserQueryKey.Home]);
  return user?.default_layout === 'student';
};

const notifyStudent = () => {
  const now = Date.now();
  if (now - lastStudentToastAt < STUDENT_TOAST_WINDOW_MS) return;
  lastStudentToastAt = now;
  toast.error(i18n.t('toast.storageLimit.student', { ns: 'commonServices' }));
};

const notifyTutor = () => {
  if (tutorStorageLimitHandler) {
    tutorStorageLimitHandler();
    return;
  }

  toast.error(i18n.t('toast.storageLimit.tutor', { ns: 'commonServices' }));
};

/** Показывает диалог репетитору или сообщение ученику. Повторный вызов для той же ошибки ничего не дублирует. */
export const reportStorageLimitReached = (error: unknown): boolean => {
  if (!isStorageLimitReachedError(error)) return false;

  if (typeof error === 'object' && error !== null && (error as HandledError)[HANDLED]) {
    return true;
  }

  if (typeof error === 'object' && error !== null) {
    (error as HandledError)[HANDLED] = true;
  }

  trackProductLimitReached({
    limit_type: 'storage',
    source: 'other',
    blocked_on: 'api',
  });
  void queryClient.invalidateQueries({ queryKey: [SubscriptionQueryKey.StorageUsage] });

  if (isStudent()) {
    notifyStudent();
  } else {
    notifyTutor();
  }

  return true;
};

export { isStorageLimitReachedError };
