import { PRODUCT_ANALYTICS_EVENTS, trackProductEvent } from 'common.utils';
import { getCallSessionAnalyticsState } from './callSessionState';

let installed = false;

const resolveMediaSource = (): 'prejoin' | 'lesson' => {
  const state = getCallSessionAnalyticsState();
  return state.inLessonMediaContext ? 'lesson' : 'prejoin';
};

const trackMediaPermissionRequested = (constraints?: MediaStreamConstraints | null): void => {
  const audio_requested = Boolean(constraints?.audio);
  const video_requested = Boolean(constraints?.video);
  if (!audio_requested && !video_requested) return;

  const state = getCallSessionAnalyticsState();

  trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MEDIA_PERMISSION_REQUESTED, {
    lesson_id: state.lessonId ?? undefined,
    attempt_id: state.currentAttemptId ?? undefined,
    audio_requested,
    video_requested,
    source: resolveMediaSource(),
  });
};

/**
 * Перехватывает navigator.mediaDevices.getUserMedia и шлёт media_permission_requested
 * непосредственно перед фактическим запросом camera/microphone.
 * Один вызов getUserMedia → одно событие (не на render).
 */
export const installMediaPermissionRequestAnalytics = (): void => {
  if (typeof window === 'undefined' || installed) return;

  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices || typeof mediaDevices.getUserMedia !== 'function') return;

  installed = true;
  const originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);

  mediaDevices.getUserMedia = ((constraints?: MediaStreamConstraints) => {
    try {
      trackMediaPermissionRequested(constraints);
    } catch {
      // Аналитика не должна ломать запрос разрешений.
    }
    return originalGetUserMedia(constraints);
  }) as typeof mediaDevices.getUserMedia;
};
