import { useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DevicesBar } from '../shared';
import { useLocalParticipant, usePersistentUserChoices } from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { ScreenShareButton } from '../Bottom/ScreenShareButton';
import { DisconnectButton } from '../Bottom/DisconnectButton';

export const CompactCall = ({ saveUserChoices = true }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-call',
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'move',
  };

  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const microphoneOnChange = useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled],
  );

  const cameraOnChange = useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled],
  );

  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative flex w-[320px] flex-col gap-2 bg-transparent"
    >
      <div className="bg-gray-40 flex h-[180px] w-[320px] items-center justify-between rounded-[16px]"></div>
      <div className="flex items-center justify-between">
        <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[92px] items-center justify-center gap-1 rounded-[16px] border">
          <DevicesBar
            microTrack={microphoneTrack?.track as LocalAudioTrack}
            microEnabled={isMicrophoneEnabled}
            microTrackToggle={{
              showIcon: true,
              source: Track.Source.Microphone,
              onChange: microphoneOnChange,
            }}
            videoTrack={cameraTrack?.track as unknown as LocalVideoTrack}
            videoEnabled={isCameraEnabled}
            videoTrackToggle={{
              showIcon: true,
              source: Track.Source.Camera,
              onChange: cameraOnChange,
            }}
          />
        </div>
        <div className="bg-gray-0 border-gray-10 flex h-[48px] items-center justify-center gap-1 rounded-[16px] border p-1">
          <ScreenShareButton />
        </div>
        <DisconnectButton />
      </div>
    </div>
  );
};
