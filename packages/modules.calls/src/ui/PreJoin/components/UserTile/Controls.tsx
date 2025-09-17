import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { useCallback, useMemo } from 'react';

import { DevicesBar } from '../../../shared/DevicesBar';
import { usePersistentUserChoices } from '../../../../hooks/usePersistentUserChoices';

type ControlsProps = {
  audioTrack?: LocalAudioTrack;
  videoTrack?: LocalVideoTrack;
};

export const Controls = ({ audioTrack, videoTrack }: ControlsProps) => {
  const {
    userChoices: { audioEnabled, videoEnabled },
    saveAudioInputEnabled,
    saveVideoInputEnabled,
  } = usePersistentUserChoices();

  const handleAudioChange = useCallback(
    async (enabled: boolean) => {
      saveAudioInputEnabled(enabled);
      if (audioTrack) {
        if (enabled) {
          await audioTrack.unmute();
        } else {
          await audioTrack.mute();
        }
      }
    },
    [audioTrack, saveAudioInputEnabled],
  );

  const handleVideoChange = useCallback(
    async (enabled: boolean) => {
      saveVideoInputEnabled(enabled);
      if (videoTrack) {
        if (enabled) {
          await videoTrack.unmute();
        } else {
          await videoTrack.mute();
        }
      }
    },
    [videoTrack, saveVideoInputEnabled],
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
