import { pickFeedbackType } from './feedbackType';
import {
  accrueActiveUsageMs,
  FEEDBACK_ELIGIBLE_USAGE_MS,
  getFeedbackPromptEligibility,
  getFeedbackUsageDurationBucket,
  getShownFeedbackUsageMs,
} from './feedbackUsage';
import type {
  ProductAnalyticsFeedbackEligibility,
  ProductAnalyticsFeedbackType,
  ProductAnalyticsFeedbackUsageDurationBucket,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;
export const POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS = 6 * DAY_MS;
export const POST_LESSON_FEEDBACK_JITTER_MS = 1 * DAY_MS;
/** Fallback для записей без nextEligibleAt (старый фиксированный cooldown). */
export const POST_LESSON_FEEDBACK_COOLDOWN_MS = 7 * DAY_MS;
export const POST_LESSON_FEEDBACK_STORAGE_PREFIX = 'sovlium.feedback.postLesson.v1.';

export type PostLessonFeedbackPersisted = {
  lastPromptAt: number;
  nextEligibleAt: number;
  lastType: ProductAnalyticsFeedbackType | null;
};

export type PostLessonFeedbackSession = {
  callEligible: boolean;
  boardEligible: boolean;
  callConnectedMs: number;
  boardActiveMs: number;
  callConnectedStartedAt: number | null;
  boardLastActionAt: number | null;
  promptShown: boolean;
  pendingType: ProductAnalyticsFeedbackType | null;
  pendingEligibility: ProductAnalyticsFeedbackEligibility | null;
  pendingUsageDurationBucket: ProductAnalyticsFeedbackUsageDurationBucket | null;
  previewNonce: number;
};

const createSession = (): PostLessonFeedbackSession => ({
  callEligible: false,
  boardEligible: false,
  callConnectedMs: 0,
  boardActiveMs: 0,
  callConnectedStartedAt: null,
  boardLastActionAt: null,
  promptShown: false,
  pendingType: null,
  pendingEligibility: null,
  pendingUsageDurationBucket: null,
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

const emptyPersisted = (): PostLessonFeedbackPersisted => ({
  lastPromptAt: 0,
  nextEligibleAt: 0,
  lastType: null,
});

const isEligibleMs = (durationMs: number): boolean => durationMs >= FEEDBACK_ELIGIBLE_USAGE_MS;

const keepUsageAcrossCallStart = (next: PostLessonFeedbackSession): PostLessonFeedbackSession => ({
  ...next,
  callEligible: session.callEligible,
  boardEligible: session.boardEligible,
  callConnectedMs: session.callConnectedMs,
  boardActiveMs: session.boardActiveMs,
  callConnectedStartedAt: session.callConnectedStartedAt,
  boardLastActionAt: session.boardLastActionAt,
});

export function computeNextFeedbackEligibleAt(shownAt: number, random = Math.random): number {
  const jitterMs = Math.floor(random() * POST_LESSON_FEEDBACK_JITTER_MS);
  return shownAt + POST_LESSON_FEEDBACK_MIN_COOLDOWN_MS + jitterMs;
}

export function readPostLessonFeedbackPersisted(
  userId: string | number,
): PostLessonFeedbackPersisted {
  if (!canUseStorage()) {
    return emptyPersisted();
  }

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return emptyPersisted();

    const parsed = JSON.parse(raw) as Partial<PostLessonFeedbackPersisted>;
    const lastPromptAt =
      typeof parsed.lastPromptAt === 'number' && Number.isFinite(parsed.lastPromptAt)
        ? parsed.lastPromptAt
        : 0;
    const nextEligibleAt =
      typeof parsed.nextEligibleAt === 'number' && Number.isFinite(parsed.nextEligibleAt)
        ? parsed.nextEligibleAt
        : 0;
    const lastType =
      parsed.lastType === 'call' || parsed.lastType === 'board' ? parsed.lastType : null;

    return { lastPromptAt, nextEligibleAt, lastType };
  } catch {
    return emptyPersisted();
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
  const { lastPromptAt, nextEligibleAt } = readPostLessonFeedbackPersisted(userId);
  if (nextEligibleAt > 0) {
    return now < nextEligibleAt;
  }
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
  const callConnectedMs = Math.max(session.callConnectedMs, FEEDBACK_ELIGIBLE_USAGE_MS);
  if (session.callEligible && session.callConnectedMs === callConnectedMs) return;
  session = { ...session, callEligible: true, callConnectedMs };
  emit();
}

export function markBoardFeedbackEligible(): void {
  const boardActiveMs = Math.max(session.boardActiveMs, FEEDBACK_ELIGIBLE_USAGE_MS);
  if (session.boardEligible && session.boardActiveMs === boardActiveMs) return;
  session = { ...session, boardEligible: true, boardActiveMs };
  emit();
}

export function startCallFeedbackUsage(now = Date.now()): void {
  if (session.callConnectedStartedAt != null) return;
  session = { ...session, callConnectedStartedAt: now };
}

export function flushCallFeedbackUsage(now = Date.now()): void {
  const startedAt = session.callConnectedStartedAt;
  if (startedAt == null) return;

  const delta = Math.max(0, now - startedAt);
  const callConnectedMs = session.callConnectedMs + delta;
  const becameEligible = !session.callEligible && isEligibleMs(callConnectedMs);

  session = {
    ...session,
    callConnectedMs,
    callConnectedStartedAt: null,
    callEligible: session.callEligible || isEligibleMs(callConnectedMs),
  };

  if (becameEligible) emit();
}

export function noteBoardFeedbackActivity(now = Date.now()): void {
  const lastActionAt = session.boardLastActionAt;
  const delta = lastActionAt == null ? 0 : accrueActiveUsageMs(now - lastActionAt);
  const boardActiveMs = session.boardActiveMs + delta;
  const becameEligible = !session.boardEligible && isEligibleMs(boardActiveMs);

  session = {
    ...session,
    boardActiveMs,
    boardLastActionAt: now,
    boardEligible: session.boardEligible || isEligibleMs(boardActiveMs),
  };

  if (becameEligible) emit();
}

export function flushBoardFeedbackUsage(now = Date.now()): void {
  const lastActionAt = session.boardLastActionAt;
  if (lastActionAt == null) return;

  const delta = accrueActiveUsageMs(now - lastActionAt);
  const boardActiveMs = session.boardActiveMs + delta;
  const becameEligible = !session.boardEligible && isEligibleMs(boardActiveMs);

  session = {
    ...session,
    boardActiveMs,
    boardLastActionAt: null,
    boardEligible: session.boardEligible || isEligibleMs(boardActiveMs),
  };

  if (becameEligible) emit();
}

export function beginCallFeedbackSession(): void {
  if (session.pendingType || session.promptShown) {
    return;
  }

  session = keepUsageAcrossCallStart(createSession());
  emit();
}

/** Сброс окна, если репетитор вышел из кабинета и toast уже не в очереди. */
export function endClassroomFeedbackWindow(): void {
  if (session.pendingType || session.promptShown) return;
  if (
    !session.callEligible &&
    !session.boardEligible &&
    session.callConnectedMs === 0 &&
    session.boardActiveMs === 0 &&
    session.callConnectedStartedAt == null &&
    session.boardLastActionAt == null
  ) {
    return;
  }
  session = createSession();
  emit();
}

export function clearPendingPostLessonFeedback(): void {
  if (!session.pendingType) return;
  session = {
    ...session,
    pendingType: null,
    pendingEligibility: null,
    pendingUsageDurationBucket: null,
  };
  emit();
}

/**
 * Ставит в очередь один toast после конца сессии. Cooldown пишется в момент постановки
 * (фактический показ), чтобы не чаще 1 раза за 6–7 дней.
 *
 * Cooldown хранится в localStorage пользователя. Отдельного user-state API в бэкенде нет,
 * поэтому между устройствами интервал сейчас не синхронизируется.
 */
export function tryQueuePostLessonFeedback(
  userId: string | number,
  now = Date.now(),
): ProductAnalyticsFeedbackType | null {
  flushCallFeedbackUsage(now);
  flushBoardFeedbackUsage(now);

  if (session.promptShown || session.pendingType) return null;
  if (!session.callEligible && !session.boardEligible) return null;
  if (isPostLessonFeedbackCooldownActive(userId, now)) return null;

  const persisted = readPostLessonFeedbackPersisted(userId);
  const type = pickFeedbackType(
    { callEligible: session.callEligible, boardEligible: session.boardEligible },
    persisted.lastType,
  );
  if (!type) return null;

  const eligibility = getFeedbackPromptEligibility(session.callEligible, session.boardEligible);
  const usageMs = getShownFeedbackUsageMs(type, session);
  const usageDurationBucket =
    getFeedbackUsageDurationBucket(usageMs) ??
    getFeedbackUsageDurationBucket(FEEDBACK_ELIGIBLE_USAGE_MS);

  if (!eligibility || !usageDurationBucket) return null;

  const lastPromptAt = now;
  session = {
    ...session,
    promptShown: true,
    pendingType: type,
    pendingEligibility: eligibility,
    pendingUsageDurationBucket: usageDurationBucket,
  };
  writePostLessonFeedbackPersisted(userId, {
    lastPromptAt,
    nextEligibleAt: computeNextFeedbackEligibleAt(lastPromptAt),
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
    ...createSession(),
    callEligible: feedbackType === 'call',
    boardEligible: feedbackType === 'board',
    callConnectedMs: feedbackType === 'call' ? FEEDBACK_ELIGIBLE_USAGE_MS : 0,
    boardActiveMs: feedbackType === 'board' ? FEEDBACK_ELIGIBLE_USAGE_MS : 0,
    promptShown: false,
    pendingType: feedbackType,
    pendingEligibility: feedbackType === 'call' ? 'call_only' : 'board_only',
    pendingUsageDurationBucket: '15_30m',
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
