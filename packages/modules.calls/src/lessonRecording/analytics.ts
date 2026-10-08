import {
  PRODUCT_ANALYTICS_EVENTS,
  getFileSizeBucket,
  getProductAnalyticsRole,
  trackProductEvent,
  type LessonRecordingFailureReason,
} from 'common.utils';
import type { RecordingFormat } from './types';

type RecordingAnalyticsContext = {
  lessonId?: string;
  role?: string | null;
  participantsCount: number;
  format: RecordingFormat;
};

export function trackLessonRecordingStarted(input: RecordingAnalyticsContext): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_RECORDING_STARTED, {
    lesson_id: input.lessonId,
    actor_role: 'tutor',
    role: getProductAnalyticsRole(input.role),
    participants_count: input.participantsCount,
    format: input.format,
  });
}

export function trackLessonRecordingCompleted(
  input: RecordingAnalyticsContext & { durationSeconds: number; sizeBytes: number },
): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_RECORDING_COMPLETED, {
    lesson_id: input.lessonId,
    actor_role: 'tutor',
    role: getProductAnalyticsRole(input.role),
    duration_seconds: input.durationSeconds,
    participants_count: input.participantsCount,
    format: input.format,
    size_bucket: getFileSizeBucket(input.sizeBytes),
  });
}

export function trackLessonRecordingFailed(
  input: Omit<RecordingAnalyticsContext, 'participantsCount'> & {
    reason: LessonRecordingFailureReason;
    durationSeconds?: number;
    participantsCount?: number;
  },
): void {
  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.LESSON_RECORDING_FAILED, {
    lesson_id: input.lessonId,
    actor_role: 'tutor',
    role: getProductAnalyticsRole(input.role),
    reason: input.reason,
    duration_seconds: input.durationSeconds,
    participants_count: input.participantsCount,
    format: input.format,
  });
}
