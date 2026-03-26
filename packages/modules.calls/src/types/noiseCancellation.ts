/** Режим шумоподавления микрофона: выкл, стандартное (WebRTC), усиленное (Krisp). */
export type NoiseCancellationMode = 'off' | 'webrtc' | 'krisp';

export const NOISE_CANCELLATION_MODES: readonly NoiseCancellationMode[] = [
  'off',
  'webrtc',
  'krisp',
] as const;

export function isNoiseCancellationMode(value: string): value is NoiseCancellationMode {
  return NOISE_CANCELLATION_MODES.includes(value as NoiseCancellationMode);
}
