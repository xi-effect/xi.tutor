/** Пороги совместного присутствия tutor + ученик. Это и есть «реальный» урок. */
export const REAL_LESSON_THRESHOLDS_MIN = [5, 15] as const;

export type RealLessonThresholdMin = (typeof REAL_LESSON_THRESHOLDS_MIN)[number];

export type LessonOverlapState = {
  accumulatedMs: number;
  openStartedAt: number | null;
  remoteCount: number;
  studentJoinedSent: boolean;
  sentThresholds: Set<RealLessonThresholdMin>;
};

export type LessonOverlapUpdate = {
  /** Первый переход 0 → 1+ удалённых участников в этой сессии звонка. */
  studentJoined: boolean;
  studentsCount: number;
  overlapSeconds: number;
  reachedThresholds: RealLessonThresholdMin[];
};

export function createLessonOverlapState(): LessonOverlapState {
  return {
    accumulatedMs: 0,
    openStartedAt: null,
    remoteCount: 0,
    studentJoinedSent: false,
    sentThresholds: new Set(),
  };
}

/**
 * Копит время, когда в комнате tutor есть хотя бы один удалённый участник.
 * Стена часов самого tutor сюда не входит: тестовый урок без ученика порог не закрывает.
 * Короткий разрыв суммируется внутри одной сессии подключения, а не обнуляет эпизод.
 */
export function updateLessonOverlap(
  state: LessonOverlapState,
  remoteCount: number,
  now: number,
): LessonOverlapUpdate {
  const nextCount = Math.max(0, Math.floor(remoteCount));
  const wasPresent = state.remoteCount > 0;
  const isPresent = nextCount > 0;

  if (wasPresent && !isPresent && state.openStartedAt != null) {
    state.accumulatedMs += Math.max(0, now - state.openStartedAt);
    state.openStartedAt = null;
  } else if (!wasPresent && isPresent) {
    state.openStartedAt = now;
  }

  state.remoteCount = nextCount;

  const openMs = state.openStartedAt != null ? Math.max(0, now - state.openStartedAt) : 0;
  const overlapSeconds = Math.floor((state.accumulatedMs + openMs) / 1000);

  const studentJoined = isPresent && !state.studentJoinedSent;
  if (studentJoined) {
    state.studentJoinedSent = true;
  }

  const reachedThresholds: RealLessonThresholdMin[] = [];
  for (const threshold of REAL_LESSON_THRESHOLDS_MIN) {
    if (state.sentThresholds.has(threshold)) continue;
    if (overlapSeconds < threshold * 60) continue;
    state.sentThresholds.add(threshold);
    reachedThresholds.push(threshold);
  }

  return {
    studentJoined,
    studentsCount: nextCount,
    overlapSeconds,
    reachedThresholds,
  };
}
