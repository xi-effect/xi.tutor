import { usePreviewTracks } from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { useMemo, useCallback } from 'react';

import { DevicesBar } from '../../../shared/DevicesBar';
import { useCallStore } from '../../../../store/callStore';

export const Controls = () => {
  const audioDeviceId = useCallStore((state) => state.audioDeviceId);
  const audioEnabled = useCallStore((state) => state.audioEnabled);

  const videoDeviceId = useCallStore((state) => state.videoDeviceId);
  const videoEnabled = useCallStore((state) => state.videoEnabled);

  const updateStore = useCallStore((state) => state.updateStore);

  const onError = useCallback(() => {}, []);

  const tracks = usePreviewTracks(
    {
      audio: audioEnabled ? { deviceId: audioDeviceId } : false,
      video: videoEnabled ? { deviceId: videoDeviceId } : false,
    },
    onError,
  );

  console.log('tracks', tracks);

  const videoTrack = useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Video)[0] as LocalVideoTrack,
    [tracks],
  );

  const audioTrack = useMemo(
    () => tracks?.filter((track) => track.kind === Track.Kind.Audio)[0] as LocalAudioTrack,
    [tracks],
  );

  // console.log('audioTrack', audioTrack);

  console.log('videoDeviceId', videoDeviceId);
  console.log('videoEnabled', videoEnabled);
  console.log('videoTrack', videoTrack);

  const handleAudioChange = useCallback(
    (enabled: boolean) => {
      updateStore('audioEnabled', enabled);
    },
    [updateStore],
  );

  const handleVideoChange = useCallback(
    (enabled: boolean) => {
      console.log('handleVideoChange', enabled);
      updateStore('videoEnabled', enabled);
    },
    [updateStore],
  );

  console.log('Controls');

  return (
    <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[92px] items-center justify-center gap-1 rounded-[16px] border">
      <DevicesBar
        microTrack={audioTrack}
        microEnabled={audioEnabled}
        microTrackToggle={{
          showIcon: true,
          source: Track.Source.Microphone,
          onChange: handleAudioChange,
        }}
        videoTrack={videoTrack}
        videoEnabled={videoEnabled}
        videoTrackToggle={{
          showIcon: true,
          source: Track.Source.Camera,
          onChange: handleVideoChange,
        }}
      />
    </div>
  );
};
