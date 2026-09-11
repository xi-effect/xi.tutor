import { PRODUCT_ANALYTICS_EVENTS } from './events';
import { createAttemptId } from './attemptId';
import { prepareFeedbackComment } from './feedbackComment';
import type { MathBankAnalyticsSource, MathBankFavoriteAction } from './types';
import { trackProductEvent } from './umami';

const SESSION_STORAGE_KEY = 'sovlium_math_bank_session';

type MathBankSession = {
  session_id: string;
  opened_at_ms: number;
};

export type MathBankSearchSnapshot = {
  search: string;
  grades: number[];
  topics: string[];
  difficultyGroups: string[];
  exam: string | null;
  examTaskNumbers: number[];
  taskTypes: string[];
  favoritesOnly: boolean;
};

export type MathBankTaskSnapshot = {
  id: string;
  grade: number;
  topicId?: string;
  taskType?: string;
  difficulty?: number;
  subject?: string;
};

type StoredSession = MathBankSession | null;

const readSession = (): StoredSession => {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MathBankSession;
    if (!parsed.session_id || !parsed.opened_at_ms) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeSession = (session: MathBankSession) => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage может быть недоступен — события всё равно уходят без session_id.
  }
};

const startSession = (): MathBankSession => {
  const session = {
    session_id: createAttemptId(),
    opened_at_ms: Date.now(),
  };
  writeSession(session);
  return session;
};

const taskProps = (task: MathBankTaskSnapshot) => ({
  task_id: task.id,
  subject: task.subject ?? 'mathematics',
  grade: task.grade,
  ...(task.topicId ? { topic_id: task.topicId } : {}),
  ...(task.taskType ? { task_type: task.taskType } : {}),
  ...(typeof task.difficulty === 'number' ? { difficulty: task.difficulty } : {}),
});

export const hasMathBankSearchSignal = (filters: MathBankSearchSnapshot) =>
  filters.search.trim().length > 0 ||
  filters.grades.length > 0 ||
  filters.topics.length > 0 ||
  filters.difficultyGroups.length > 0 ||
  filters.exam !== null ||
  filters.examTaskNumbers.length > 0 ||
  filters.taskTypes.length > 0 ||
  filters.favoritesOnly;

/** Только длина запроса и выбранные фильтры. Текст запроса не входит в payload. */
export const toMathBankSearchProps = (
  filters: MathBankSearchSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const queryLength = filters.search.trim().length;

  return {
    source,
    ...(queryLength > 0 ? { query_length: queryLength } : {}),
    ...(filters.grades.length > 0 ? { grade: filters.grades } : {}),
    ...(filters.topics.length > 0 ? { topic: filters.topics } : {}),
    ...(filters.difficultyGroups.length > 0 ? { difficulty: filters.difficultyGroups } : {}),
    ...(filters.exam ? { exam: filters.exam } : {}),
    ...(filters.examTaskNumbers.length > 0 ? { exam_task_numbers: filters.examTaskNumbers } : {}),
    ...(filters.taskTypes.length > 0 ? { task_type: filters.taskTypes } : {}),
    ...(filters.favoritesOnly ? { favorites_only: true } : {}),
  };
};

/** Для тестов. */
export const resetMathBankAnalyticsSession = () => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
};

export const trackMathBankOpen = (source: MathBankAnalyticsSource, subject = 'mathematics') => {
  const session = startSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_BANK_OPEN, {
    event_version: 1,
    source,
    subject,
    session_id: session.session_id,
  });
};

export const trackMathBankSearch = (
  filters: MathBankSearchSnapshot,
  source: MathBankAnalyticsSource,
  subject = 'mathematics',
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_BANK_SEARCH, {
    event_version: 1,
    subject,
    ...toMathBankSearchProps(filters, source),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskOpen = (task: MathBankTaskSnapshot, source: MathBankAnalyticsSource) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_OPEN, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

const trackInsert = (
  eventName:
    | typeof PRODUCT_ANALYTICS_EVENTS.MATH_TASK_INSERT_BOARD
    | typeof PRODUCT_ANALYTICS_EVENTS.MATH_TASK_INSERT_NOTE,
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(eventName, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session
      ? {
          session_id: session.session_id,
          time_to_insert_ms: Math.max(0, Date.now() - session.opened_at_ms),
        }
      : {}),
  });
};

export const trackMathTaskInsertBoard = (
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource = 'board',
) => {
  trackInsert(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_INSERT_BOARD, task, source);
};

export const trackMathTaskInsertNote = (
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource = 'editor',
) => {
  trackInsert(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_INSERT_NOTE, task, source);
};

export const trackMathTaskCopy = (task: MathBankTaskSnapshot, source: MathBankAnalyticsSource) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_COPY, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskSolutionOpen = (
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_SOLUTION_OPEN, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskAnswerOpen = (
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_ANSWER_OPEN, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskHintOpen = (
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_HINT_OPEN, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskFavoriteToggle = (
  taskId: string,
  action: MathBankFavoriteAction,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_FAVORITE_TOGGLE, {
    event_version: 1,
    source,
    task_id: taskId,
    action,
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskNextVariant = (
  task: MathBankTaskSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_NEXT_VARIANT, {
    event_version: 1,
    source,
    ...taskProps(task),
    ...(session ? { session_id: session.session_id } : {}),
  });
};

export const trackMathTaskReport = (
  task: MathBankTaskSnapshot,
  comment: string,
  source: MathBankAnalyticsSource,
) => {
  const prepared = prepareFeedbackComment(comment);
  if (!prepared) {
    return false;
  }

  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_TASK_REPORT, {
    event_version: 1,
    source,
    ...taskProps(task),
    comment: prepared,
    ...(session ? { session_id: session.session_id } : {}),
  });
  return true;
};
