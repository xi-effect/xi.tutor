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
  getDurationBucket,
  getProductAnalyticsRole,
  trackProductEvent,
  type ProductAnalyticsLessonType,
} from 'common.utils';
import { getCallSessionAnalyticsState, resetCallSessionAnalyticsState } from './callSessionState';

const resolveLessonType = (kind?: string): ProductAnalyticsLessonType => {
  if (kind === 'individual') return 'individual';
  if (kind === 'group') return 'group';
  return 'unknown';
};

const MIN_LESSON_FINISH_MINUTES = 5;

export const ProductCallAnalyticsTracker = () => {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { isScreenShareEnabled } = useLocalParticipant();
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const navigation = useCallsNavigation();

  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const activeBoardId = useCallStore((state) => state.activeBoardId);
  const isStarted = useCallStore((state) => state.isStarted);
  const token = useCallStore((state) => state.token);

  const role = getProductAnalyticsRole(user?.default_layout);
  const wasConnectedRef = useRef(false);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    for (const threshold of DURATION_THRESHOLDS_MIN) {
      if (elapsedMinutes < threshold || state.sentDurationThresholds.has(threshold)) continue;

      state.sentDurationThresholds.add(threshold);
      if (threshold === 5) {
        state.duration5Reached = true;
      }

      if (role === 'tutor') {
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_DURATION_REACHED, {
          role,
          duration_min: threshold,
          lesson_type: lessonType,
          used_board: state.usedBoard,
          used_screenshare: state.usedScreenshare,
          students_count: room.remoteParticipants.size,
        });
      }
    }
  };

  const trackLessonFinished = () => {
    const state = getCallSessionAnalyticsState();
    if (state.lessonFinishedSent || !state.connectedAt) return;

    const elapsedMinutes = getElapsedMinutes();
    if (elapsedMinutes < MIN_LESSON_FINISH_MINUTES && !state.duration5Reached) return;

    syncUsageFlags();

    state.lessonFinishedSent = true;

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_FINISHED, {
      role,
      duration_bucket: getDurationBucket(elapsedMinutes),
      lesson_type: getLessonType(),
      used_board: state.usedBoard,
      used_screenshare: state.usedScreenshare,
    });
  };

  const trackCallConnectionFailed = (
    reason: 'token_error' | 'connection_error' | 'permission_error' | 'unknown',
  ) => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECTION_FAILED, {
      role,
      reason,
    });
  };

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
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.CALL_CONNECTED, {
          role,
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
  }, [connectionState, role, activeClassroom, activeBoardId, isScreenShareEnabled]);

  useEffect(() => {
    if (connectionState === 'disconnected' && wasConnectedRef.current) {
      wasConnectedRef.current = false;
      trackLessonFinished();
      resetCallSessionAnalyticsState();
    }
  }, [connectionState]);

  useEffect(() => {
    const handleMediaDevicesError = () => {
      trackCallConnectionFailed('permission_error');
    };

    room.on(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    return () => {
      room.off(RoomEvent.MediaDevicesError, handleMediaDevicesError);
    };
  }, [room]);

  useEffect(() => {
    return () => {
      if (!isStarted || !wasConnectedRef.current) return;
      trackLessonFinished();
    };
  }, [isStarted]);

  useEffect(() => {
    if (!activeBoardId) return;
    getCallSessionAnalyticsState().usedBoard = true;
  }, [activeBoardId]);

  return null;
};
