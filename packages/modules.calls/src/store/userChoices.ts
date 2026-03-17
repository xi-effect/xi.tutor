import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loadUserChoices,
  saveUserChoices,
  LocalUserChoices as LocalUserChoicesLK,
} from '@livekit/components-core';
import { VideoQuality } from 'livekit-client';
import type { NoiseCancellationMode } from '../types/noiseCancellation';

export type VideoResolution = 'h720' | 'h360' | 'h180';

export type LocalUserChoices = LocalUserChoicesLK & {
  noiseReductionEnabled?: boolean;
  blurEnabled?: boolean;
  audioOutputDeviceId?: string;
  videoPublishResolution?: VideoResolution;
  videoSubscribeQuality?: VideoQuality;
  /** Включено ли шумоподавление (любой режим кроме off). */
  noiseCancellationEnabled?: boolean;
  /** Режим шумоподавления: off | webrtc | krisp. */
  noiseCancellationMode?: NoiseCancellationMode;
  /** Порог чувствительности микрофона (0–1). 0 = noise gate выключен, >0 = порог срабатывания. */
  micInputSensitivity?: number;
};

function getUserChoicesState(): LocalUserChoices {
  return {
    noiseReductionEnabled: false,
    blurEnabled: false,
    audioOutputDeviceId: 'default',
    videoPublishResolution: 'h720',
    videoSubscribeQuality: VideoQuality.HIGH,
    noiseCancellationEnabled: false,
    noiseCancellationMode: 'webrtc',
    micInputSensitivity: 0,
    ...loadUserChoices(),
  };
}

export const useUserChoicesStore = create<LocalUserChoices>()(
  persist(
    () => ({
      ...getUserChoicesState(),
    }),
    {
      name: 'user-choices-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          saveUserChoices(state, false);
        }
      },
    },
  ),
);
