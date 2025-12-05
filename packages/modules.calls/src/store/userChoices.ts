import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loadUserChoices,
  saveUserChoices,
  LocalUserChoices as LocalUserChoicesLK,
} from '@livekit/components-core';
import { VideoQuality } from 'livekit-client';

export type VideoResolution = 'h720' | 'h360' | 'h180';

export type LocalUserChoices = LocalUserChoicesLK & {
  noiseReductionEnabled?: boolean;
  blurEnabled?: boolean;
  audioOutputDeviceId?: string;
  videoPublishResolution?: VideoResolution;
  videoSubscribeQuality?: VideoQuality;
};

function getUserChoicesState(): LocalUserChoices {
  return {
    noiseReductionEnabled: false,
    blurEnabled: false,
    audioOutputDeviceId: 'default',
    videoPublishResolution: 'h720',
    videoSubscribeQuality: VideoQuality.HIGH,
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
