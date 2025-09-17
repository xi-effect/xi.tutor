import { useUserChoicesStore } from '../store/userChoices';
import type { VideoResolution } from '../store/userChoices';
import type { VideoQuality } from 'livekit-client';

export function usePersistentUserChoices() {
  const userChoices = useUserChoicesStore();

  return {
    userChoices,
    saveAudioInputEnabled: (isEnabled: boolean) => {
      useUserChoicesStore.setState({ audioEnabled: isEnabled });
    },
    saveVideoInputEnabled: (isEnabled: boolean) => {
      useUserChoicesStore.setState({ videoEnabled: isEnabled });
    },
    saveAudioInputDeviceId: (deviceId: string) => {
      useUserChoicesStore.setState({ audioDeviceId: deviceId });
    },
    saveAudioOutputDeviceId: (deviceId: string) => {
      useUserChoicesStore.setState({ audioOutputDeviceId: deviceId });
    },
    saveVideoInputDeviceId: (deviceId: string) => {
      useUserChoicesStore.setState({ videoDeviceId: deviceId });
    },
    saveVideoPublishResolution: (resolution: VideoResolution) => {
      useUserChoicesStore.setState({ videoPublishResolution: resolution });
    },
    saveVideoSubscribeQuality: (quality: VideoQuality) => {
      useUserChoicesStore.setState({ videoSubscribeQuality: quality });
    },
    saveUsername: (username: string) => {
      useUserChoicesStore.setState({ username });
    },
    saveNoiseReductionEnabled: (enabled: boolean) => {
      useUserChoicesStore.setState({ noiseReductionEnabled: enabled });
    },
  };
}
