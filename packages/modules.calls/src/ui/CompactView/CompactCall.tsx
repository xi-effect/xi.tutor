import { useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DevicesBar } from '../shared';
import { useLocalParticipant, usePersistentUserChoices } from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { ScreenShareButton } from '../Bottom/ScreenShareButton';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { ChatButton } from '../Bottom/ChatButton';
import { RaiseHandButton } from '../Bottom/RaiseHandButton';

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
      {...attributes}
      {...listeners}
      className="bg-gray-0 border-gray-20 flex h-[120px] w-[200px] flex-col rounded-2xl border p-3 shadow-lg"
    >
      <div className="flex flex-1 items-center justify-center">
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
      <div className="flex items-center justify-center gap-1">
        <ScreenShareButton />
        <ChatButton />
        <RaiseHandButton />
        <DisconnectButton />
      </div>
    </div>
  );
};
