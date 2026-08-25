import { PRODUCT_ANALYTICS_EVENTS, trackProductEvent } from 'common.utils';
import { getCallSessionAnalyticsState } from './callSessionState';

let installed = false;

type MediaPermissionState = PermissionState | 'unknown';

const resolveMediaSource = (): 'prejoin' | 'lesson' => {
  const state = getCallSessionAnalyticsState();
  return state.inLessonMediaContext ? 'lesson' : 'prejoin';
};

const queryMediaPermission = async (name: 'camera' | 'microphone'): Promise<MediaPermissionState> => {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }

  try {
    const status = await navigator.permissions.query({ name } as PermissionDescriptor);
    return status.state;
  } catch {
    return 'unknown';
  }
};

/** prompt — браузер покажет диалог; unknown — Permissions API недоступен (Safari и т.п.). */
const isLikelyBrowserPrompt = (state: MediaPermissionState): boolean =>
  state === 'prompt' || state === 'unknown';

/**
 * getUserMedia вызывается и после выдачи разрешения (превью, смена устройства, mute/unmute).
 * Событие нужно только когда пользователь ещё может увидеть системный диалог.
 */
const shouldTrackPermissionRequest = async (
  audioRequested: boolean,
  videoRequested: boolean,
): Promise<boolean> => {
  const [microphoneState, cameraState] = await Promise.all([
    audioRequested ? queryMediaPermission('microphone') : Promise.resolve<MediaPermissionState>('granted'),
    videoRequested ? queryMediaPermission('camera') : Promise.resolve<MediaPermissionState>('granted'),
  ]);

  return (
    (audioRequested && isLikelyBrowserPrompt(microphoneState)) ||
    (videoRequested && isLikelyBrowserPrompt(cameraState))
  );
};

const trackMediaPermissionRequested = (constraints?: MediaStreamConstraints | null): void => {
  const audio_requested = Boolean(constraints?.audio);
  const video_requested = Boolean(constraints?.video);
  if (!audio_requested && !video_requested) return;

  const state = getCallSessionAnalyticsState();
  if (state.mediaPermissionRequestedSent) return;
  // Резервируем слот синхронно: параллельные getUserMedia не должны дать пачку событий.
  state.mediaPermissionRequestedSent = true;

  void (async () => {
    try {
      const shouldTrack = await shouldTrackPermissionRequest(audio_requested, video_requested);
      if (!shouldTrack) return;

      const session = getCallSessionAnalyticsState();
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.MEDIA_PERMISSION_REQUESTED, {
        lesson_id: session.lessonId ?? undefined,
        attempt_id: session.currentAttemptId ?? undefined,
        audio_requested,
        video_requested,
        source: resolveMediaSource(),
      });
    } catch {
      // Аналитика не должна ломать запрос разрешений.
    }
  })();
};

/**
 * Перехватывает navigator.mediaDevices.getUserMedia и шлёт media_permission_requested
 * только при реальном (или неопределённом) системном промпте, один раз за сессию звонка.
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
