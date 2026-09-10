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
  grade: task.grade,
  ...(task.topicId ? { topic_id: task.topicId } : {}),
  ...(task.taskType ? { task_type: task.taskType } : {}),
  ...(typeof task.difficulty === 'number' ? { difficulty: task.difficulty } : {}),
});

export const toMathBankSearchProps = (
  filters: MathBankSearchSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const queryLength = filters.search.trim().length;
  const hasFilters =
    filters.grades.length > 0 ||
    filters.topics.length > 0 ||
    filters.difficultyGroups.length > 0 ||
    filters.exam !== null ||
    filters.examTaskNumbers.length > 0 ||
    filters.taskTypes.length > 0 ||
    filters.favoritesOnly;

  return {
    source,
    query_length: queryLength,
    has_query: queryLength > 0,
    has_filters: hasFilters,
    grades_count: filters.grades.length,
    topics_count: filters.topics.length,
    difficulty_count: filters.difficultyGroups.length,
    exam: filters.exam ?? 'none',
    exam_numbers_count: filters.examTaskNumbers.length,
    types_count: filters.taskTypes.length,
    favorites_only: filters.favoritesOnly,
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

export const trackMathBankOpen = (source: MathBankAnalyticsSource) => {
  const session = startSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_BANK_OPEN, {
    event_version: 1,
    source,
    session_id: session.session_id,
  });
};

export const trackMathBankSearch = (
  filters: MathBankSearchSnapshot,
  source: MathBankAnalyticsSource,
) => {
  const session = readSession();
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MATH_BANK_SEARCH, {
    event_version: 1,
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
    task_id: task.id,
    grade: task.grade,
    ...(task.topicId ? { topic_id: task.topicId } : {}),
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
    task_id: task.id,
    grade: task.grade,
    ...(task.topicId ? { topic_id: task.topicId } : {}),
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
    task_id: task.id,
    grade: task.grade,
    ...(task.topicId ? { topic_id: task.topicId } : {}),
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
    task_id: task.id,
    grade: task.grade,
    ...(task.topicId ? { topic_id: task.topicId } : {}),
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
    task_id: task.id,
    grade: task.grade,
    comment: prepared,
    ...(task.topicId ? { topic_id: task.topicId } : {}),
    ...(session ? { session_id: session.session_id } : {}),
  });
  return true;
};
