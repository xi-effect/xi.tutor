import {
  ControlBarProps,
  useLocalParticipant,
  // useLocalParticipantPermissions,
  usePersistentUserChoices,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { DevicesBar } from '../shared/DevicesBar/DevicesBar';
import { useCallback } from 'react';
import { DisconnectButton } from './DisconnectButton';
import { ScreenShareButton } from './ScreenShareButton';
import { WhiteBoardButton } from './WhiteBoardButton';
// import { ChatButton } from './ChatButton';
// import { RaiseHandButton } from './RaiseHandButton';

export const BottomBar = ({ saveUserChoices = true }: ControlBarProps) => {
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
    <div className="w-full">
      <div className="flex w-full flex-row justify-between p-4">
        <div />
        <div className="flex flex-row gap-4">
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
            <WhiteBoardButton />
            {/* <ChatButton /> */}
            {/* <RaiseHandButton /> */}
          </div>
        </div>
        <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[48px] items-center justify-center gap-1 rounded-[16px] border p-1">
          <DisconnectButton />
        </div>
      </div>
    </div>
  );
};
