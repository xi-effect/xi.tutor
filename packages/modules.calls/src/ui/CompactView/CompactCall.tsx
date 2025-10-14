import { useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { DevicesBar } from '../shared';
import {
  useLocalParticipant,
  usePersistentUserChoices,
  VideoTrack,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { ScreenShareButton } from '../Bottom/ScreenShareButton';
import { DisconnectButton } from '../Bottom/DisconnectButton';
import { useSpeakingParticipant } from '../../hooks/useSpeakingParticipant';
import { isTrackReference } from '@livekit/components-core';

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

  // Получаем говорящего участника
  const speakingParticipant = useSpeakingParticipant();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex w-[320px] flex-col"
    >
      {/* Видео говорящего участника */}
      {speakingParticipant && isTrackReference(speakingParticipant) && (
        <div className="bg-gray-0 border-gray-20 mb-2 flex max-h-[180px] max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border-1 shadow-lg">
          <VideoTrack
            trackRef={speakingParticipant}
            className="h-full w-full object-cover"
            style={{
              transform: 'rotateY(180deg)',
              background: 'var(--xi-bg-gray-40)',
              backgroundColor: 'var(--xi-bg-gray-40)',
            }}
          />
        </div>
      )}
      <div className="flex h-[40px] flex-row">
        <div className="bg-gray-0 border-gray-20 flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <DevicesBar
            className="h-[32px] w-[32px]"
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
        <div className="bg-gray-0 border-gray-20 ml-auto flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <ScreenShareButton className="h-[32px] w-[32px]" />
          {/* <ChatButton /> */}
          {/* <RaiseHandButton /> */}
        </div>
        <div className="bg-gray-0 border-gray-20 ml-1 flex items-center justify-center rounded-2xl border p-1 shadow-lg">
          <DisconnectButton className="h-[32px] w-[32px]" />
        </div>
      </div>
    </div>
  );
};
