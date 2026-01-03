import {
  ControlBarProps,
  useLocalParticipant,
  // useLocalParticipantPermissions,
  usePersistentUserChoices,
  useTrackToggle,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { DevicesBar } from '../shared/DevicesBar/DevicesBar';
import { useCallback } from 'react';
import { DisconnectButton } from './DisconnectButton';
import { ScreenShareButton } from './ScreenShareButton';
import { WhiteBoardButton } from './WhiteBoardButton';
import { RaiseHandButton } from './RaiseHandButton';
import { ChatButton } from './ChatButton';
import { useCurrentUser } from 'common.services';
import { useCallStore } from '../../store';
import { cn } from '@xipkg/utils';

export const BottomBar = ({ saveUserChoices = true }: ControlBarProps) => {
  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const { isMicrophoneEnabled, isCameraEnabled, microphoneTrack, cameraTrack } =
    useLocalParticipant();

  // Используем useTrackToggle для правильного управления треками (как в Settings)
  const microphoneToggle = useTrackToggle({
    source: Track.Source.Microphone,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveAudioInputEnabled(enabled);
      }
    },
  });

  const cameraToggle = useTrackToggle({
    source: Track.Source.Camera,
    onChange: (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveVideoInputEnabled(enabled);
      }
    },
  });

  // Обработчики включения/выключения (как в Settings)
  const handleMicrophoneToggle = useCallback(async () => {
    microphoneToggle.toggle();
  }, [microphoneToggle]);

  const handleCameraToggle = useCallback(async () => {
    cameraToggle.toggle();
  }, [cameraToggle]);

  const { isChatOpen } = useCallStore();

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  return (
    <div className={cn('w-full', isChatOpen && 'invisible sm:visible')}>
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
                onChange: handleMicrophoneToggle,
              }}
              videoTrack={cameraTrack?.track as unknown as LocalVideoTrack}
              videoEnabled={isCameraEnabled}
              videoTrackToggle={{
                showIcon: true,
                source: Track.Source.Camera,
                onChange: handleCameraToggle,
              }}
              className="relative"
            />
          </div>
          <div className="bg-gray-0 border-gray-10 flex h-[48px] items-center justify-center gap-1 rounded-[16px] border p-1">
            <ScreenShareButton />
            {isTutor && <WhiteBoardButton />}
            <ChatButton />
            <RaiseHandButton />
          </div>
        </div>
        <div className="bg-gray-0 border-gray-10 flex h-[48px] w-[48px] items-center justify-center gap-1 rounded-[16px] border p-1">
          <DisconnectButton />
        </div>
      </div>
    </div>
  );
};
