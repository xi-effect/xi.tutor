import { useEffect, useRef } from 'react';
import { useConnectionState, useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useCallStore } from '@xipkg/calls-store';
import { useCallsNavigation } from '@xipkg/calls-providers';
import { useQueryClient } from '@tanstack/react-query';
import { ClassroomsQueryKey, type ClassroomTutorResponseSchema } from 'common.api';
import { useCurrentUser } from 'common.services';
import {
  DURATION_THRESHOLDS_MIN,
  PRODUCT_ANALYTICS_EVENTS,
  createAttemptId,
  getDurationBucket,
  getProductAnalyticsRole,
  mapPermissionError,
  measureDurationMs,
  trackProductEvent,
  type CallFailureReason,
  type ProductAnalyticsLessonType,
} from 'common.utils';
import {
  beginNewConnectAttempt,
  getCallSessionAnalyticsState,
  resetCallSessionAnalyticsState,
} from './callSessionState';

const resolveLessonType = (kind?: string): ProductAnalyticsLessonType => {
  if (kind === 'individual') return 'individual';
  if (kind === 'group') return 'group';
  return 'unknown';
};

const MIN_LESSON_FINISH_MINUTES = 5;

export const ProductCallAnalyticsTracker = () => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { isScreenShareEnabled, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigation = useCallsNavigation();

  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const activeBoardId = useCallStore((state) => state.activeBoardId);
  const isStarted = useCallStore((state) => state.isStarted);
  const token = useCallStore((state) => state.token);

  const role = getProductAnalyticsRole(user?.default_layout);
  const actorRole = role === 'student' ? 'student' : 'tutor';
  const wasConnectedRef = useRef(false);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getLessonId = (): string => {
    const state = getCallSessionAnalyticsState();
    if (state.lessonId) return state.lessonId;

    const classroomId = activeClassroom ?? navigation.getCallId();
    if (classroomId) {
      state.lessonId = String(classroomId);
      return state.lessonId;
    }

    return 'unknown';
  };

  const getLessonType = (): ProductAnalyticsLessonType => {
    const classroomId = activeClassroom ?? navigation.getCallId();
    if (!classroomId) return 'unknown';

    const classroom = queryClient.getQueryData<ClassroomTutorResponseSchema>([
      ClassroomsQueryKey.GetClassroom,
      Number(classroomId),
    ]);

    return resolveLessonType(classroom?.kind);
  };

  const getElapsedMinutes = (): number => {
    const { connectedAt } = getCallSessionAnalyticsState();
    if (!connectedAt) return 0;
    return Math.floor((Date.now() - connectedAt) / 60_000);
  };

  const syncUsageFlags = () => {
    const state = getCallSessionAnalyticsState();

    if (activeBoardId) {
      state.usedBoard = true;
    }

    if (isScreenShareEnabled) {
      state.usedScreenshare = true;
    }
  };

  const trackDurationThresholds = () => {
    const state = getCallSessionAnalyticsState();
    if (!state.connectedAt) return;

    syncUsageFlags();

    const elapsedMinutes = getElapsedMinutes();
    const lessonType = getLessonType();
    const studentsCount = room.remoteParticipants.size;
    const lessonId = getLessonId();

    for (const threshold of DURATION_THRESHOLDS_MIN) {
      if (elapsedMinutes < threshold || state.sentDurationThresholds.has(threshold)) continue;

      state.sentDurationThresholds.add(threshold);
      if (threshold === 5) {
        state.duration5Reached = true;
      }

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_DURATION_REACHED, {
        lesson_id: lessonId,
        actor_role: actorRole,
        role,
        duration_threshold: threshold,
        duration_min: threshold,
        lesson_type: lessonType,
        students_count: studentsCount,
        student_joined: studentsCount > 0,
        board_used: state.usedBoard,
        screen_share_used: state.usedScreenshare,
        used_board: state.usedBoard,
        used_screenshare: state.usedScreenshare,
      });
    }
  };

  const trackLessonFinished = (
    finishReason: 'user_left' | 'connection_lost' | 'unknown' = 'user_left',
  ) => {
    const state = getCallSessionAnalyticsState();
    if (state.lessonFinishedSent || !state.connectedAt) return;

    const elapsedMinutes = getElapsedMinutes();
    if (elapsedMinutes < MIN_LESSON_FINISH_MINUTES && !state.duration5Reached) return;

    syncUsageFlags();

    state.lessonFinishedSent = true;
    const totalDurationSeconds = Math.max(0, Math.round((Date.now() - state.connectedAt) / 1000));

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_FINISHED, {
      lesson_id: getLessonId(),
      actor_role: actorRole,
      role,
      total_duration_seconds: totalDurationSeconds,
      finish_reason: finishReason,
      students_joined_count: room.remoteParticipants.size,
      duration_bucket: getDurationBucket(elapsedMinutes),
      lesson_type: getLessonType(),
      used_board: state.usedBoard,
      used_screenshare: state.usedScreenshare,
    });
  };

  const trackCallConnectionFailed = (reason: CallFailureReason, retryAvailable = true) => {
    const state = getCallSessionAnalyticsState();
    state.hadConnectionFailure = true;

    const attemptId = state.currentAttemptId ?? createAttemptId();
    const durationMs =
      state.connectAttemptStartedAt != null
        ? measureDurationMs(state.connectAttemptStartedAt)
        : undefined;

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECTION_FAILED, {
      lesson_id: getLessonId(),
      attempt_id: attemptId,
      actor_role: actorRole,
      role,
      attempt_number: state.attemptNumber || 1,
      reason,
      duration_ms: durationMs,
      retry_available: retryAvailable,
    });
  };

  // PreJoin: токен есть, ещё не подключены
  useEffect(() => {
    if (!token || connectionState === 'connected') return;

    const state = getCallSessionAnalyticsState();
    if (state.prejoinViewedSent) return;

    state.prejoinViewedSent = true;
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.PREJOIN_VIEWED, {
      lesson_id: getLessonId(),
      actor_role: actorRole,
    });
  }, [token, connectionState, actorRole]);

  // Попытка подключения
  useEffect(() => {
    if (connectionState !== 'connecting') return;

    const state = getCallSessionAnalyticsState();
    const attemptId = state.currentAttemptId ?? createAttemptId();

    if (!state.currentAttemptId) {
      beginNewConnectAttempt(attemptId);
    }

    if (state.callConnectAttemptedSentForAttempt === attemptId) return;

    const current = getCallSessionAnalyticsState();
    current.callConnectAttemptedSentForAttempt = attemptId;

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECT_ATTEMPTED, {
      lesson_id: getLessonId(),
      attempt_id: attemptId,
      actor_role: actorRole,
      attempt_number: current.attemptNumber || 1,
    });
  }, [connectionState, actorRole]);

  useEffect(() => {
    if (!token) {
      resetCallSessionAnalyticsState();
    }
  }, [token]);

  useEffect(() => {
    if (connectionState !== 'connected') return;

    const state = getCallSessionAnalyticsState();

    if (!wasConnectedRef.current) {
      wasConnectedRef.current = true;
      state.connectedAt = Date.now();

      if (!state.callConnectedSent) {
        state.callConnectedSent = true;
        const durationMs =
          state.connectAttemptStartedAt != null
            ? measureDurationMs(state.connectAttemptStartedAt)
            : undefined;

        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECTED, {
          lesson_id: getLessonId(),
          attempt_id: state.currentAttemptId ?? undefined,
          actor_role: actorRole,
          role,
          attempt_number: state.attemptNumber || 1,
          duration_ms: durationMs,
          recovered_after_failure: state.hadConnectionFailure,
          lesson_type: getLessonType(),
        });
      }
    }

    durationIntervalRef.current = setInterval(trackDurationThresholds, 30_000);
    trackDurationThresholds();

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [connectionState, role, actorRole, activeClassroom, activeBoardId, isScreenShareEnabled]);

  useEffect(() => {
    if (connectionState === 'disconnected' && wasConnectedRef.current) {
      wasConnectedRef.current = false;
      trackLessonFinished('connection_lost');
      resetCallSessionAnalyticsState();
    }
  }, [connectionState]);

  // Media permissions via LocalParticipant tracks / MediaDevicesError
  useEffect(() => {
    const state = getCallSessionAnalyticsState();
    const lessonId = getLessonId();

    if ((isCameraEnabled || isMicrophoneEnabled) && !state.mediaPermissionGrantedSent) {
      state.mediaPermissionGrantedSent = true;
      const mediaType =
        isCameraEnabled && isMicrophoneEnabled
          ? 'camera_and_microphone'
          : isCameraEnabled
            ? 'camera'
            : 'microphone';

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MEDIA_PERMISSION_GRANTED, {
        lesson_id: lessonId,
        media_type: mediaType,
      });
    }
  }, [isCameraEnabled, isMicrophoneEnabled]);

  useEffect(() => {
    const handleMediaDevicesError = (error: Error) => {
      const state = getCallSessionAnalyticsState();
      const reason = mapPermissionError(error);

      if (!state.mediaPermissionDeniedSent) {
        state.mediaPermissionDeniedSent = true;
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MEDIA_PERMISSION_DENIED, {
          lesson_id: getLessonId(),
          attempt_id: state.currentAttemptId ?? undefined,
          media_type: 'camera_and_microphone',
          reason,
        });
      }

      trackCallConnectionFailed(
        reason === 'user_denied' || reason === 'browser_blocked' ? 'permission_error' : 'unknown',
      );
    };

    room.on(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    return () => {
      room.off(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    };
  }, [room, actorRole]);

  useEffect(() => {
    return () => {
      if (!isStarted || !wasConnectedRef.current) return;
      trackLessonFinished('user_left');
    };
  }, [isStarted]);

  useEffect(() => {
    if (!activeBoardId) return;
    getCallSessionAnalyticsState().usedBoard = true;
  }, [activeBoardId]);

  return null;
};
