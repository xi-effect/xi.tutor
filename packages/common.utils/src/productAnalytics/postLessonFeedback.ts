import { pickFeedbackType } from './feedbackType';
import type { ProductAnalyticsFeedbackType } from './types';

export const POST_LESSON_FEEDBACK_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
export const POST_LESSON_FEEDBACK_STORAGE_PREFIX = 'sovlium.feedback.postLesson.v1.';

export type PostLessonFeedbackPersisted = {
  lastPromptAt: number;
  lastType: ProductAnalyticsFeedbackType | null;
};

export type PostLessonFeedbackSession = {
  callEligible: boolean;
  boardEligible: boolean;
  promptShown: boolean;
  pendingType: ProductAnalyticsFeedbackType | null;
  previewNonce: number;
};

const createSession = (): PostLessonFeedbackSession => ({
  callEligible: false,
  boardEligible: false,
  promptShown: false,
  pendingType: null,
  previewNonce: 0,
});

let session = createSession();
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const storageKey = (userId: string | number) =>
  `${POST_LESSON_FEEDBACK_STORAGE_PREFIX}${String(userId)}`;

const canUseStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

export function readPostLessonFeedbackPersisted(
  userId: string | number,
): PostLessonFeedbackPersisted {
  if (!canUseStorage()) {
    return { lastPromptAt: 0, lastType: null };
  }

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return { lastPromptAt: 0, lastType: null };

    const parsed = JSON.parse(raw) as Partial<PostLessonFeedbackPersisted>;
    const lastPromptAt =
      typeof parsed.lastPromptAt === 'number' && Number.isFinite(parsed.lastPromptAt)
        ? parsed.lastPromptAt
        : 0;
    const lastType =
      parsed.lastType === 'call' || parsed.lastType === 'board' ? parsed.lastType : null;

    return { lastPromptAt, lastType };
  } catch {
    return { lastPromptAt: 0, lastType: null };
  }
}

export function writePostLessonFeedbackPersisted(
  userId: string | number,
  value: PostLessonFeedbackPersisted,
): void {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(value));
  } catch {
    // private mode / quota
  }
}

export function isPostLessonFeedbackCooldownActive(
  userId: string | number,
  now = Date.now(),
): boolean {
  const { lastPromptAt } = readPostLessonFeedbackPersisted(userId);
  if (!lastPromptAt) return false;
  return now - lastPromptAt < POST_LESSON_FEEDBACK_COOLDOWN_MS;
}

export function getPostLessonFeedbackSession(): PostLessonFeedbackSession {
  return session;
}

export function subscribePostLessonFeedback(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function markCallFeedbackEligible(): void {
  if (session.callEligible) return;
  session = { ...session, callEligible: true };
  emit();
}

export function markBoardFeedbackEligible(): void {
  if (session.boardEligible) return;
  session = { ...session, boardEligible: true };
  emit();
}

export function beginCallFeedbackSession(): void {
  if (session.pendingType || session.promptShown) {
    session = { ...session, callEligible: false };
    emit();
    return;
  }

  session = {
    ...createSession(),
    boardEligible: session.boardEligible,
  };
  emit();
}

/** Сброс окна, если репетитор вышел из кабинета и toast уже не в очереди. */
export function endClassroomFeedbackWindow(): void {
  if (session.pendingType || session.promptShown) return;
  if (!session.callEligible && !session.boardEligible) return;
  session = createSession();
  emit();
}

export function clearPendingPostLessonFeedback(): void {
  if (!session.pendingType) return;
  session = { ...session, pendingType: null };
  emit();
}

/**
 * Ставит в очередь один toast после конца сессии. Cooldown пишется в момент постановки
 * (фактический показ), чтобы не чаще 1 раза за 7 дней.
 */
export function tryQueuePostLessonFeedback(
  userId: string | number,
): ProductAnalyticsFeedbackType | null {
  if (session.promptShown || session.pendingType) return null;
  if (!session.callEligible && !session.boardEligible) return null;
  if (isPostLessonFeedbackCooldownActive(userId)) return null;

  const persisted = readPostLessonFeedbackPersisted(userId);
  const type = pickFeedbackType(
    { callEligible: session.callEligible, boardEligible: session.boardEligible },
    persisted.lastType,
  );
  if (!type) return null;

  session = { ...session, promptShown: true, pendingType: type };
  writePostLessonFeedbackPersisted(userId, {
    lastPromptAt: Date.now(),
    lastType: type,
  });
  emit();
  return type;
}

/** Предпросмотр toast из консоли: без cooldown и без записи в localStorage. */
export function debugQueuePostLessonFeedback(
  type: ProductAnalyticsFeedbackType = 'call',
): ProductAnalyticsFeedbackType {
  const feedbackType = type === 'board' ? 'board' : 'call';
  session = {
    callEligible: feedbackType === 'call',
    boardEligible: feedbackType === 'board',
    promptShown: false,
    pendingType: feedbackType,
    previewNonce: session.previewNonce + 1,
  };
  emit();
  return feedbackType;
}

export function clearPostLessonFeedbackCooldown(userId?: string | number): void {
  if (!canUseStorage()) return;

  try {
    if (userId != null) {
      window.localStorage.removeItem(storageKey(userId));
      return;
    }

    const keysToRemove: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(POST_LESSON_FEEDBACK_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // private mode / quota
  }
}

/** Для тестов. */
export function resetPostLessonFeedbackState(): void {
  session = createSession();
  emit();
}
