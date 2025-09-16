import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { useCallback, useMemo } from 'react';

import { DevicesBar } from '../../../shared/DevicesBar';
import { useCallStore } from '../../../../store/callStore';

type ControlsProps = {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
};

export const Controls = ({ audioTrack, videoTrack }: ControlsProps) => {
  const audioEnabled = useCallStore((state) => state.audioEnabled);
  const videoEnabled = useCallStore((state) => state.videoEnabled);

  const updateStore = useCallStore((state) => state.updateStore);

  const handleAudioChange = useCallback(
    (enabled: boolean) => {
      console.log('handleAudioChange - updating store to:', enabled);
      updateStore('audioEnabled', enabled);
    },
    [updateStore],
  );

  const handleVideoChange = useCallback(
    (enabled: boolean) => {
      console.log('handleVideoChange - updating store to:', enabled);
      updateStore('videoEnabled', enabled);
    },
    [updateStore],
  );

  const microTrackToggle = useMemo(
    () => ({
      showIcon: true,
      source: Track.Source.Microphone,
      onChange: handleAudioChange,
    }),
    [handleAudioChange],
  );

  const videoTrackToggle = useMemo(
    () => ({
      showIcon: true,
      source: Track.Source.Camera,
      onChange: handleVideoChange,
    }),
    [handleVideoChange],
  );

  return (
    <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[92px] items-center justify-center gap-1 rounded-[16px] border">
      <DevicesBar
        microTrack={audioTrack}
        microEnabled={audioEnabled}
        microTrackToggle={microTrackToggle}
        videoTrack={videoTrack}
        videoEnabled={videoEnabled}
        videoTrackToggle={videoTrackToggle}
      />
    </div>
  );
};
