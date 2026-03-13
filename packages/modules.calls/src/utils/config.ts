import { env } from 'common.env';

export const serverUrl = env.VITE_SERVER_URL_LIVEKIT;
export const serverUrlDev = env.VITE_SERVER_URL_LIVEKIT_DEV;
export const devToken = env.VITE_LIVEKIT_DEV_TOKEN;
export const isDevMode = env.VITE_LIVEKIT_DEV_MODE;
export const allowKrispNoiseCancellation = env.VITE_ALLOW_KRISP_NOISE_CANCELLATION;
/** Включён ли UI шумоподавления (выбор режима). По умолчанию false — только WebRTC через Room. */
export const noiseCancellationFeatureEnabled = env.VITE_NOISE_CANCELLATION_FEATURE_ENABLED;

/** Базовые WebRTC-ограничения для захвата аудио (эхо, шум, AGC). */
export function getBaselineAudioCaptureOptions(): {
  echoCancellation: true;
  noiseSuppression: true;
  autoGainControl: true;
} {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };
}
