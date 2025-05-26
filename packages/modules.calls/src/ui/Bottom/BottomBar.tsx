import {
  ControlBarProps,
  useLocalParticipant,
  // useLocalParticipantPermissions,
  usePersistentUserChoices,
} from '@livekit/components-react';
import { LocalAudioTrack, LocalVideoTrack, Track } from 'livekit-client';
import { supportsScreenSharing } from '@livekit/components-core';
import { TrackToggle } from '../shared/TrackToggle/TrackToggle';
import { DevicesBar } from '../shared/DevicesBar/DevicesBar';
import { useCallback, useMemo, useState } from 'react';
import { DisconnectButton } from './DisconnectButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
export const BottomBar = ({ variation, controls, saveUserChoices = true }: ControlBarProps) => {
  const visibleControls = { leave: true, screenShare: true, ...controls };

  // const localPermissions = useLocalParticipantPermissions();

  // if (!localPermissions) {
  //   visibleControls.camera = false;
  //   visibleControls.chat = false;
  //   visibleControls.microphone = false;
  //   visibleControls.screenShare = false;
  // } else {
  //   visibleControls.camera ??= localPermissions.canPublish;
  //   visibleControls.microphone ??= localPermissions.canPublish;
  //   visibleControls.screenShare ??= localPermissions.canPublish;
  //   visibleControls.chat ??= localPermissions.canPublishData && controls?.chat;
  // }

  useMemo(() => variation === 'minimal' || variation === 'verbose', [variation]);

  const showText = useMemo(() => variation === 'textOnly' || variation === 'verbose', [variation]);
  const { saveAudioInputEnabled, saveVideoInputEnabled } = usePersistentUserChoices({
    preventSave: !saveUserChoices,
  });

  const browserSupportsScreenSharing = supportsScreenSharing();

  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

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
  const onScreenShareChange = useCallback(
    (enabled: boolean) => {
      setIsScreenShareEnabled(enabled);
    },
    [setIsScreenShareEnabled],
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
            {visibleControls.screenShare && browserSupportsScreenSharing && (
              <Tooltip delayDuration={1000}>
                <TooltipTrigger asChild>
                  <TrackToggle
                    source={Track.Source.ScreenShare}
                    captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
                    onChange={onScreenShareChange}
                  >
                    {showText && (isScreenShareEnabled ? 'Stop screen share' : 'Share screen')}
                  </TrackToggle>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  Поделиться экраном
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <DisconnectButton />
      </div>
    </div>
  );
};
