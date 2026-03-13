/** События телеметрии шумоподавления для umami. */
export const NOISE_CANCELLATION_EVENTS = {
  MODE_CHANGED: 'noise_cancellation_mode_changed',
  APPLY_FAILED: 'noise_cancellation_apply_failed',
  FALLBACK_TO_WEBRTC: 'noise_cancellation_fallback_to_webrtc',
  KRISP_UNSUPPORTED_BROWSER: 'noise_cancellation_krisp_unsupported_browser',
} as const;

type NoiseCancellationEvent =
  (typeof NOISE_CANCELLATION_EVENTS)[keyof typeof NOISE_CANCELLATION_EVENTS];

function getUmami(): { track: (name: string, data?: Record<string, string>) => void } | undefined {
  if (typeof window === 'undefined') return undefined;
  const win = window as Window & {
    umami?: { track: (name: string, data?: Record<string, string>) => void };
  };
  return win.umami;
}

export function trackNoiseCancellationEvent(
  event: NoiseCancellationEvent,
  data?: Record<string, string>,
): void {
  const umami = getUmami();
  if (umami) {
    umami.track(event, data);
  }
}
