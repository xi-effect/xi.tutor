import { useEffect } from 'react';
import { useCallStore } from '../store/callStore';
import { useMediaDevices } from '@livekit/components-react';

export const useInitUserDevices = () => {
  const audioDeviceId = useCallStore((state) => state.audioDeviceId);
  const videoDeviceId = useCallStore((state) => state.videoDeviceId);

  const videoDevices = useMediaDevices({ kind: 'videoinput' });
  const audioDevices = useMediaDevices({ kind: 'audioinput' });

  const updateStore = useCallStore((state) => state.updateStore);

  useEffect(() => {
    if (!audioDeviceId && audioDevices?.length > 0) {
      console.log('Setting initial audio device:', audioDevices[0].deviceId);
      updateStore('audioDeviceId', audioDevices[0].deviceId);
    }
  }, [audioDeviceId, audioDevices, updateStore]);

  useEffect(() => {
    if (!videoDeviceId && videoDevices?.length > 0) {
      console.log('Setting initial video device:', videoDevices[0].deviceId);
      updateStore('videoDeviceId', videoDevices[0].deviceId);
    }
  }, [videoDeviceId, videoDevices, updateStore]);
};
