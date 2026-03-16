// Базовые типы для модуля calls
export type ParticipantType = {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
};

export type { NoiseCancellationMode } from './noiseCancellation';
export { NOISE_CANCELLATION_MODES, isNoiseCancellationMode } from './noiseCancellation';
