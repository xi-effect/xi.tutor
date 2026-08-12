import type { LessonDurationThresholdMin } from 'common.utils';

export type CallSessionAnalyticsState = {
  connectedAt: number | null;
  connectAttemptStartedAt: number | null;
  currentAttemptId: string | null;
  attemptNumber: number;
  /** attempt_id, для которых уже был call_connection_failed */
  failedAttemptIds: Set<string>;
  sentDurationThresholds: Set<LessonDurationThresholdMin>;
  duration5Reached: boolean;
  usedBoard: boolean;
  usedScreenshare: boolean;
  lessonFinishedSent: boolean;
  callConnectedSent: boolean;
  callConnectAttemptedSentForAttempt: string | null;
  lessonStartedSent: boolean;
  lessonJoinedSent: boolean;
  prejoinViewedSent: boolean;
  mediaPermissionGrantedSent: boolean;
  mediaPermissionDeniedSent: boolean;
  /** Комната уже была connected в текущей сессии звонка → source=lesson */
  inLessonMediaContext: boolean;
  lessonId: string | null;
};

export const createCallSessionAnalyticsState = (): CallSessionAnalyticsState => ({
  connectedAt: null,
  connectAttemptStartedAt: null,
  currentAttemptId: null,
  attemptNumber: 0,
  failedAttemptIds: new Set(),
  sentDurationThresholds: new Set(),
  duration5Reached: false,
  usedBoard: false,
  usedScreenshare: false,
  lessonFinishedSent: false,
  callConnectedSent: false,
  callConnectAttemptedSentForAttempt: null,
  lessonStartedSent: false,
  lessonJoinedSent: false,
  prejoinViewedSent: false,
  mediaPermissionGrantedSent: false,
  mediaPermissionDeniedSent: false,
  inLessonMediaContext: false,
  lessonId: null,
});

let callSessionState = createCallSessionAnalyticsState();

export const getCallSessionAnalyticsState = (): CallSessionAnalyticsState => callSessionState;

export const resetCallSessionAnalyticsState = (): void => {
  callSessionState = createCallSessionAnalyticsState();
};

/** Сброс только флажков попытки подключения (для reconnect). */
export const beginNewConnectAttempt = (attemptId: string): CallSessionAnalyticsState => {
  callSessionState.currentAttemptId = attemptId;
  callSessionState.connectAttemptStartedAt =
    typeof performance !== 'undefined' ? performance.now() : Date.now();
  callSessionState.attemptNumber += 1;
  callSessionState.callConnectedSent = false;
  callSessionState.callConnectAttemptedSentForAttempt = null;
  return callSessionState;
};

/** Пометить, что для attempt_id уже был call_connection_failed. */
export const markConnectAttemptFailed = (attemptId: string): void => {
  callSessionState.failedAttemptIds.add(attemptId);
  if (!callSessionState.currentAttemptId) {
    callSessionState.currentAttemptId = attemptId;
  }
};

/** recovered_after_failure для конкретного attempt_id. */
export const wasRecoveredAfterFailure = (attemptId: string | null | undefined): boolean => {
  if (!attemptId) return false;
  return callSessionState.failedAttemptIds.has(attemptId);
};
