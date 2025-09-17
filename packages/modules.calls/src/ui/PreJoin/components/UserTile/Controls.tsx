import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { useCallback, useMemo, useEffect } from 'react';

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

  // Отладочная информация
  useEffect(() => {
    console.log('Controls state:', {
      audioEnabled,
      videoEnabled,
      audioTrack: audioTrack ? { muted: audioTrack.isMuted } : null,
      videoTrack: videoTrack ? { muted: videoTrack.isMuted } : null,
    });
  }, [audioEnabled, videoEnabled, audioTrack, videoTrack]);

  const handleAudioChange = useCallback(
    async (enabled: boolean) => {
      console.log('Controls: handleAudioChange', {
        enabled,
        audioTrack: !!audioTrack,
        currentMuted: audioTrack?.isMuted,
      });
      saveAudioInputEnabled(enabled);
      if (audioTrack) {
        if (enabled) {
          console.log('Controls: unmuting audio track');
          await audioTrack.unmute();
        } else {
          console.log('Controls: muting audio track');
          await audioTrack.mute();
        }
        console.log('Controls: audio track state after change', { muted: audioTrack.isMuted });
      } else {
        console.log('Controls: no audio track available');
      }
    },
    [audioTrack, saveAudioInputEnabled],
  );

  const handleVideoChange = useCallback(
    async (enabled: boolean) => {
      console.log('Controls: handleVideoChange', {
        enabled,
        videoTrack: !!videoTrack,
        currentMuted: videoTrack?.isMuted,
      });
      saveVideoInputEnabled(enabled);
      if (videoTrack) {
        if (enabled) {
          console.log('Controls: unmuting video track');
          await videoTrack.unmute();
        } else {
          console.log('Controls: muting video track');
          await videoTrack.mute();
        }
        console.log('Controls: video track state after change', { muted: videoTrack.isMuted });
      } else {
        console.log('Controls: no video track available');
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
